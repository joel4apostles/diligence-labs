import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/expert/assign-project - Expert assigns themselves to a project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, assignmentType, estimatedHours, specialization } = body

    if (!projectId) {
      return NextResponse.json({ 
        error: 'Project ID is required' 
      }, { status: 400 })
    }

    // Get expert profile
    const expertProfile = await prisma.expertProfile.findUnique({
      where: { 
        userId: session.user.id,
        verificationStatus: 'VERIFIED'
      },
      include: {
        user: true
      }
    })

    if (!expertProfile) {
      return NextResponse.json({ 
        error: 'Verified expert profile required' 
      }, { status: 403 })
    }

    // Check if project exists and is available for assignment
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: true,
        submitter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!['EXPERT_ASSIGNMENT', 'EVALUATION_IN_PROGRESS'].includes(project.status)) {
      return NextResponse.json({ 
        error: 'Project is not available for evaluation' 
      }, { status: 400 })
    }

    // Check if expert is already assigned to this project
    const existingAssignment = await prisma.projectAssignment.findFirst({
      where: {
        projectId,
        expertId: expertProfile.id
      }
    })

    if (existingAssignment) {
      return NextResponse.json({ 
        error: 'You are already assigned to this project' 
      }, { status: 400 })
    }

    // Check assignment limits (max 3 experts per project)
    if (project.assignments.length >= 3) {
      return NextResponse.json({ 
        error: 'Project already has maximum number of assigned experts' 
      }, { status: 400 })
    }

    // Check expert's current workload (optional - can be enhanced later)
    const currentAssignments = await prisma.projectAssignment.count({
      where: {
        expertId: expertProfile.id,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS']
        }
      }
    })

    // Max 5 active projects per expert (can be tier-based)
    const maxProjects = expertProfile.expertTier === 'GOLD' ? 10 : 
                       expertProfile.expertTier === 'SILVER' ? 7 : 5

    if (currentAssignments >= maxProjects) {
      return NextResponse.json({ 
        error: `Maximum active projects limit reached (${maxProjects})` 
      }, { status: 400 })
    }

    // Create the assignment
    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId,
        expertId: expertProfile.id,
        assignmentType: assignmentType || 'PRIMARY',
        status: 'ASSIGNED',
        estimatedHours: estimatedHours || null,
        specialization: specialization || null,
        acceptedAt: new Date()
      },
      include: {
        project: {
          select: {
            name: true,
            category: true,
            status: true
          }
        },
        expert: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Update project status to EVALUATION_IN_PROGRESS if it was EXPERT_ASSIGNMENT
    if (project.status === 'EXPERT_ASSIGNMENT') {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'EVALUATION_IN_PROGRESS' }
      })
    }

    // Create activity log
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPERT_PROJECT_ASSIGNMENT',
        details: JSON.stringify({
          projectId,
          projectName: project.name,
          assignmentType: assignment.assignmentType,
          estimatedHours,
          specialization
        }),
        ipAddress: request.ip || 'unknown'
      }
    })

    // Award reputation points for taking on assignments
    const pointsAwarded = assignmentType === 'PRIMARY' ? 25 : 15
    
    await Promise.all([
      prisma.expertProfile.update({
        where: { id: expertProfile.id },
        data: {
          reputationPoints: {
            increment: pointsAwarded
          }
        }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          reputationPoints: {
            increment: pointsAwarded
          }
        }
      })
    ])

    return NextResponse.json({
      message: 'Successfully assigned to project',
      assignment,
      pointsAwarded,
      projectStatus: project.status === 'EXPERT_ASSIGNMENT' ? 'EVALUATION_IN_PROGRESS' : project.status
    })

  } catch (error) {
    console.error('Project assignment error:', error)
    return NextResponse.json({ 
      error: 'Failed to assign to project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/expert/assign-project - Expert removes themselves from project assignment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ 
        error: 'Project ID is required' 
      }, { status: 400 })
    }

    // Get expert profile
    const expertProfile = await prisma.expertProfile.findUnique({
      where: { 
        userId: session.user.id,
        verificationStatus: 'VERIFIED'
      }
    })

    if (!expertProfile) {
      return NextResponse.json({ 
        error: 'Expert profile not found' 
      }, { status: 403 })
    }

    // Find the assignment
    const assignment = await prisma.projectAssignment.findFirst({
      where: {
        projectId,
        expertId: expertProfile.id
      },
      include: {
        project: true
      }
    })

    if (!assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found' 
      }, { status: 404 })
    }

    // Check if evaluation has already been submitted
    const evaluation = await prisma.projectEvaluation.findFirst({
      where: {
        projectId,
        expertId: expertProfile.id,
        submittedAt: {
          not: null
        }
      }
    })

    if (evaluation) {
      return NextResponse.json({ 
        error: 'Cannot unassign after evaluation has been submitted' 
      }, { status: 400 })
    }

    // Delete the assignment
    await prisma.projectAssignment.delete({
      where: { id: assignment.id }
    })

    // Check if this was the last assignment - if so, update project status back to PENDING
    const remainingAssignments = await prisma.projectAssignment.count({
      where: { projectId }
    })

    if (remainingAssignments === 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'PENDING_EVALUATION' }
      })
    }

    // Log the activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPERT_PROJECT_UNASSIGNMENT',
        details: JSON.stringify({
          projectId,
          projectName: assignment.project.name,
          assignmentType: assignment.assignmentType
        }),
        ipAddress: request.ip || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Successfully removed assignment',
      projectId,
      remainingAssignments
    })

  } catch (error) {
    console.error('Project unassignment error:', error)
    return NextResponse.json({ 
      error: 'Failed to remove assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}