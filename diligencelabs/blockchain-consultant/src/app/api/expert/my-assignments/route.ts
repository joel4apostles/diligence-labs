import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/expert/my-assignments - Get expert's current assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Note: ExpertProfile model not implemented yet
    return NextResponse.json({ 
      message: 'Expert assignments not accessible - ExpertProfile model not implemented yet',
      action: 'mock-response',
      assignments: []
    })

    /* COMMENTED OUT - UNREACHABLE CODE
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filters
    const where: any = {
      expertId: expertProfile.id
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    // Get assignments with project details
    const assignments = await prisma.projectAssignment.findMany({
      where,
      include: {
        project: {
          include: {
            submitter: {
              select: {
                name: true,
                email: true,
                image: true
              }
            },
            assignments: {
              include: {
                expert: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        image: true
                      }
                    }
                  }
                }
              }
            },
            evaluations: {
              where: {
                expertId: expertProfile.id
              }
            },
            _count: {
              select: {
                assignments: true,
                evaluations: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Show active assignments first
        { acceptedAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count
    const total = await prisma.projectAssignment.count({ where })

    // Enhance assignments with evaluation status and deadlines
    const enhancedAssignments = assignments.map(assignment => {
      const evaluation = assignment.project.evaluations[0] // Current expert's evaluation
      const daysOnProject = assignment.acceptedAt ? 
        Math.floor((new Date().getTime() - assignment.acceptedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0

      return {
        ...assignment,
        evaluation: evaluation || null,
        hasEvaluated: !!evaluation?.submittedAt,
        evaluationStatus: evaluation?.submittedAt ? 'COMPLETED' : 
                         evaluation ? 'DRAFT' : 'NOT_STARTED',
        daysOnProject,
        otherExperts: assignment.project.assignments
          .filter(a => a.expertId !== expertProfile.id)
          .map(a => ({
            name: a.expert.user.name,
            image: a.expert.user.image,
            tier: a.expert.expertTier,
            status: a.status
          })),
        projectProgress: {
          totalExperts: assignment.project._count.assignments,
          completedEvaluations: assignment.project._count.evaluations
        }
      }
    })

    // Get summary statistics
    const stats = await prisma.projectAssignment.groupBy({
      by: ['status'],
      where: { expertId: expertProfile.id },
      _count: {
        id: true
      }
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      assignments: enhancedAssignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        total,
        byStatus: statusCounts,
        completedEvaluations: enhancedAssignments.filter(a => a.hasEvaluated).length,
        pendingEvaluations: enhancedAssignments.filter(a => !a.hasEvaluated && a.status === 'ASSIGNED').length
      }
    })
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error('My assignments fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}