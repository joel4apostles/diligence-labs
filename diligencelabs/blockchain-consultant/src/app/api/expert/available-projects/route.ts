import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/expert/available-projects - Get projects available for expert assignment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Note: ExpertProfile model not implemented yet
    return NextResponse.json({ 
      message: 'Available projects not accessible - ExpertProfile model not implemented yet',
      action: 'mock-response',
      projects: [],
      totalCount: 0,
      hasMore: false
    })

    /* COMMENTED OUT - UNREACHABLE CODE
    // Get user's expert profile
    const expertProfile = await prisma.expertProfile.findUnique({
      where: { 
        userId: session.user.id,
        verificationStatus: 'VERIFIED' // Only verified experts can see projects
      }
    })

    if (!expertProfile) {
      return NextResponse.json({ 
        error: 'Expert profile not found or not verified' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'PENDING_EVALUATION'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filters
    const where: any = {
      status: {
        in: ['EXPERT_ASSIGNMENT', 'EVALUATION_IN_PROGRESS'] // Only projects that need evaluation
      }
    }

    if (category && category !== 'ALL') {
      where.category = category
    }

    if (status !== 'ALL') {
      where.status = status
    }

    // Get projects with current assignments and evaluations
    const projects = await prisma.project.findMany({
      where,
      include: {
        submitter: {
          select: {
            id: true,
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
        _count: {
          select: {
            assignments: true,
            evaluations: true
          }
        }
      },
      orderBy: [
        { priorityLevel: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.project.count({ where })

    // Check which projects the current expert is already assigned to
    const expertAssignments = await prisma.projectAssignment.findMany({
      where: {
        expertId: expertProfile.id,
        projectId: {
          in: projects.map(p => p.id)
        }
      }
    })

    const expertEvaluations = await prisma.projectEvaluation.findMany({
      where: {
        expertId: expertProfile.id,
        projectId: {
          in: projects.map(p => p.id)
        }
      }
    })

    // Enhance projects with assignment/evaluation status
    const enhancedProjects = projects.map(project => ({
      ...project,
      isAssigned: expertAssignments.some(a => a.projectId === project.id),
      hasEvaluated: expertEvaluations.some(e => e.projectId === project.id),
      expertAssignment: expertAssignments.find(a => a.projectId === project.id),
      expertEvaluation: expertEvaluations.find(e => e.projectId === project.id),
      availableSlots: Math.max(0, 3 - project._count.assignments), // Max 3 experts per project
      evaluationProgress: project._count.evaluations
    }))

    return NextResponse.json({
      projects: enhancedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      expertProfile: {
        id: expertProfile.id,
        tier: expertProfile.expertTier,
        specializations: [expertProfile.primaryExpertise, expertProfile.secondaryExpertise]
      }
    })
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error('Available projects fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch available projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}