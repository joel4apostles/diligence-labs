import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyAuthAndGetUser } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/rewards/distribute - Distribute rewards for a completed project evaluation
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthAndGetUser(headers())
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEAM_MEMBER')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, totalFee, distribution } = body

    // Validate input
    if (!projectId || !totalFee || totalFee <= 0) {
      return NextResponse.json({ error: 'Invalid project ID or fee amount' }, { status: 400 })
    }

    // Get project with evaluations and submitter details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        submitter: {
          include: {
            userReputation: true
          }
        },
        evaluations: {
          where: {
            status: 'APPROVED'
          },
          include: {
            expert: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.evaluations.length === 0) {
      return NextResponse.json({ error: 'No approved evaluations found for this project' }, { status: 400 })
    }

    // Calculate fee distribution
    const platformFeeRate = 0.30 // 30% to platform
    const expertPoolRate = 0.65  // 65% to experts
    const submitterBonusRate = 0.05 // 5% back to quality submitters

    const platformFee = totalFee * platformFeeRate
    const expertPool = totalFee * expertPoolRate
    const submitterBonus = totalFee * submitterBonusRate

    // Create reward distribution record
    const rewardDistribution = await prisma.rewardDistribution.create({
      data: {
        projectId,
        totalFee,
        platformFee,
        expertsPool: expertPool,
        status: 'PROCESSING'
      }
    })

    // Calculate individual expert rewards
    const expertPayouts = []
    const numExperts = project.evaluations.length
    const baseRewardPerExpert = expertPool / numExperts

    for (const evaluation of project.evaluations) {
      // Calculate quality bonus based on evaluation metrics
      let qualityMultiplier = 1.0
      
      // Bonus for high overall score
      if (evaluation.overallScore && evaluation.overallScore >= 8.0) {
        qualityMultiplier += 0.2
      }
      
      // Bonus for detailed comments
      const hasDetailedComments = [
        evaluation.teamComments,
        evaluation.pmfComments,
        evaluation.infrastructureComments,
        evaluation.statusComments,
        evaluation.competitiveComments,
        evaluation.riskComments
      ].filter(comment => comment && comment.length > 100).length >= 4
      
      if (hasDetailedComments) {
        qualityMultiplier += 0.15
      }

      // Bonus for expert tier
      const expertTier = evaluation.expert.expertTier
      switch (expertTier) {
        case 'PLATINUM':
        case 'DIAMOND':
          qualityMultiplier += 0.25
          break
        case 'GOLD':
          qualityMultiplier += 0.15
          break
        case 'SILVER':
          qualityMultiplier += 0.05
          break
      }

      const finalReward = baseRewardPerExpert * qualityMultiplier

      expertPayouts.push({
        rewardDistributionId: rewardDistribution.id,
        expertId: evaluation.expert.id,
        amount: finalReward,
        payoutType: 'EVALUATION_REWARD',
        status: 'PENDING'
      })

      // Update expert statistics
      await prisma.expertProfile.update({
        where: { id: evaluation.expert.id },
        data: {
          totalRewards: {
            increment: finalReward
          },
          monthlyEvaluations: {
            increment: 1
          }
        }
      })

      // Award reputation points to expert
      await prisma.expertProfile.update({
        where: { id: evaluation.expert.id },
        data: {
          reputationPoints: {
            increment: Math.floor(finalReward * 10) // 10 RP per $1 earned
          }
        }
      })
    }

    // Create expert payout records
    await prisma.expertPayout.createMany({
      data: expertPayouts
    })

    // Handle submitter bonus for quality projects
    let submitterBonusAwarded = 0
    if (project.overallScore && project.overallScore >= 8.0) {
      submitterBonusAwarded = submitterBonus
      
      // Award reputation points to submitter
      const bonusPoints = Math.floor(submitterBonus * 20) // 20 RP per $1 bonus
      
      if (project.submitter.userReputation) {
        await prisma.userReputation.update({
          where: { userId: project.submitterId },
          data: {
            totalPoints: {
              increment: bonusPoints
            }
          }
        })
      } else {
        await prisma.userReputation.create({
          data: {
            userId: project.submitterId,
            totalPoints: bonusPoints,
            level: Math.floor(bonusPoints / 100) + 1
          }
        })
      }

      // Update user reputation points
      await prisma.user.update({
        where: { id: project.submitterId },
        data: {
          reputationPoints: {
            increment: bonusPoints
          }
        }
      })

      // Create achievement for quality project
      const userRep = await prisma.userReputation.findUnique({
        where: { userId: project.submitterId }
      })

      if (userRep) {
        await prisma.userAchievement.create({
          data: {
            userReputationId: userRep.id,
            achievementType: 'QUALITY_SUBMITTER',
            title: 'Quality Project Bonus',
            description: `Received quality bonus for high-rated project: ${project.name}`,
            pointsAwarded: bonusPoints
          }
        })
      }
    }

    // Update reward distribution status
    await prisma.rewardDistribution.update({
      where: { id: rewardDistribution.id },
      data: {
        status: 'DISTRIBUTED'
      }
    })

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'PUBLISHED'
      }
    })

    return NextResponse.json({
      message: 'Rewards distributed successfully',
      distribution: {
        totalFee,
        platformFee,
        expertPool,
        submitterBonus: submitterBonusAwarded,
        expertsRewarded: expertPayouts.length,
        totalExpertRewards: expertPayouts.reduce((sum, payout) => sum + payout.amount, 0)
      },
      rewardDistributionId: rewardDistribution.id
    })

  } catch (error) {
    console.error('Reward distribution error:', error)
    return NextResponse.json({ error: 'Failed to distribute rewards' }, { status: 500 })
  }
}

// GET /api/rewards/distribute - Get reward distribution history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const user = await verifyAuthAndGetUser(headers())
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const where: any = {}
    if (projectId) {
      where.projectId = projectId
    }

    // If not admin, only show distributions for user's projects or expert payouts
    if (user.role !== 'ADMIN' && user.role !== 'TEAM_MEMBER') {
      // Get user's expert profile if exists
      const expertProfile = await prisma.expertProfile.findUnique({
        where: { userId: user.id }
      })

      if (expertProfile) {
        // Show distributions where user is either submitter or expert
        where.OR = [
          {
            project: {
              submitterId: user.id
            }
          },
          {
            payouts: {
              some: {
                expertId: expertProfile.id
              }
            }
          }
        ]
      } else {
        // Only show distributions for user's projects
        where.project = {
          submitterId: user.id
        }
      }
    }

    const skip = (page - 1) * limit

    const [distributions, total] = await Promise.all([
      prisma.rewardDistribution.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              category: true,
              submitter: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          payouts: {
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
          }
        },
        orderBy: {
          distributionDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.rewardDistribution.count({ where })
    ])

    return NextResponse.json({
      distributions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Reward distribution history error:', error)
    return NextResponse.json({ error: 'Failed to fetch reward distribution history' }, { status: 500 })
  }
}