import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyAuthAndGetUser } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/projects - Get all projects or user's projects
export async function GET(request: NextRequest) {
  try {
    // Note: Project model not implemented yet
    return NextResponse.json({ 
      message: 'Projects not accessible - Project model not implemented yet',
      action: 'mock-response',
      projects: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      }
    })

    /* COMMENTED OUT - UNREACHABLE CODE
    const { searchParams } = new URL(request.url)
    const userOnly = searchParams.get('userOnly') === 'true'
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const authResult = await verifyAuthAndGetUser(request)
    const user = authResult.error ? null : authResult.user
    
    if (userOnly && !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const where: any = {}
    if (userOnly && user) {
      where.submitterId = user.id
    }
    if (status) {
      where.status = status
    }
    if (category) {
      where.category = category
    }

    const skip = (page - 1) * limit

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          evaluations: {
            include: {
              expert: {
                include: {
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              evaluations: true,
              assignments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Submit a new project
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthAndGetUser(request)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Note: Project model not implemented yet
    return NextResponse.json({ 
      message: 'Project submission not available - Project model not implemented yet',
      action: 'mock-response'
    })

    /* COMMENTED OUT - UNREACHABLE CODE
    const user = authResult.error ? null : authResult.user
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check monthly project limits
    const now = new Date()
    const userWithLimits = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        monthlyProjectLimit: true,
        monthlyProjectsUsed: true,
        lastResetDate: true,
        submitterTier: true
      }
    })

    if (!userWithLimits) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if we need to reset monthly usage
    const lastReset = new Date(userWithLimits.lastResetDate)
    const shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()

    let currentUsage = userWithLimits.monthlyProjectsUsed
    if (shouldReset) {
      currentUsage = 0
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyProjectsUsed: 0,
          lastResetDate: now
        }
      })
    }

    // Check if user has exceeded their monthly limit
    if (currentUsage >= userWithLimits.monthlyProjectLimit) {
      return NextResponse.json({ 
        error: 'Monthly project submission limit exceeded',
        details: {
          currentUsage,
          limit: userWithLimits.monthlyProjectLimit,
          tier: userWithLimits.submitterTier,
          upgradeRequired: true
        }
      }, { status: 429 })
    }

    const body = await request.json()
    const {
      name,
      description,
      website,
      category,
      foundingTeam,
      teamSize,
      keyPersonnel,
      blockchain,
      technologyStack,
      smartContract,
      repository,
      whitepaper,
      fundingRaised,
      currentTraction,
      userBase,
      monthlyRevenue,
      evaluationDeadline,
      priorityLevel,
      evaluationBudget,
      twitterHandle,
      linkedinProfile,
      discordServer,
      telegramGroup
    } = body

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, category' 
      }, { status: 400 })
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        website,
        category,
        submitterId: user.id,
        foundingTeam: foundingTeam ? JSON.stringify(foundingTeam) : null,
        teamSize,
        keyPersonnel: keyPersonnel ? JSON.stringify(keyPersonnel) : null,
        blockchain,
        technologyStack: technologyStack ? JSON.stringify(technologyStack) : null,
        smartContract,
        repository,
        whitepaper,
        fundingRaised,
        currentTraction: currentTraction ? JSON.stringify(currentTraction) : null,
        userBase,
        monthlyRevenue,
        evaluationDeadline: evaluationDeadline ? new Date(evaluationDeadline) : null,
        priorityLevel: priorityLevel || 'MEDIUM',
        evaluationBudget,
        twitterHandle,
        linkedinProfile,
        discordServer,
        telegramGroup
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Increment monthly usage counter
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyProjectsUsed: {
          increment: 1
        },
        totalProjectsSubmitted: {
          increment: 1
        }
      }
    })

    // Award reputation points for project submission
    const basePoints = 25
    const tierMultiplier = {
      'BASIC': 1.0,
      'VERIFIED': 1.2,
      'PREMIUM': 1.5,
      'VC': 2.0,
      'ECOSYSTEM_PARTNER': 3.0
    }
    
    const pointsToAward = Math.floor(basePoints * (tierMultiplier[userWithLimits.submitterTier as keyof typeof tierMultiplier] || 1.0))

    // Get or create user reputation
    let userReputation = await prisma.userReputation.findUnique({
      where: { userId: user.id }
    })

    if (!userReputation) {
      userReputation = await prisma.userReputation.create({
        data: {
          userId: user.id,
          totalPoints: pointsToAward,
          level: 1,
          projectsSubmitted: 1
        }
      })
    } else {
      await prisma.userReputation.update({
        where: { userId: user.id },
        data: {
          totalPoints: {
            increment: pointsToAward
          },
          projectsSubmitted: {
            increment: 1
          }
        }
      })
    }

    // Update user reputation points
    await prisma.user.update({
      where: { id: user.id },
      data: {
        reputationPoints: {
          increment: pointsToAward
        }
      }
    })

    return NextResponse.json({ 
      message: 'Project submitted successfully', 
      project,
      reputationAwarded: pointsToAward,
      monthlyUsage: {
        used: currentUsage + 1,
        limit: userWithLimits.monthlyProjectLimit,
        remaining: userWithLimits.monthlyProjectLimit - (currentUsage + 1)
      }
    }, { status: 201 })
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error('Project submission error:', error)
    return NextResponse.json({ error: 'Failed to submit project' }, { status: 500 })
  }
}