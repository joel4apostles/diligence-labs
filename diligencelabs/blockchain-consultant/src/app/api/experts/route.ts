import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyAuthAndGetUser } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/experts - Get expert profiles (leaderboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tierFilter = searchParams.get('tier')
    const sortBy = searchParams.get('sortBy') || 'reputationPoints'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {
      verificationStatus: 'VERIFIED'
    }
    
    if (tierFilter) {
      where.expertTier = tierFilter
    }

    const orderBy: any = {}
    orderBy[sortBy] = order

    const skip = (page - 1) * limit

    const [experts, total] = await Promise.all([
      prisma.expertProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          achievements: {
            orderBy: {
              awardedAt: 'desc'
            },
            take: 3
          },
          _count: {
            select: {
              evaluations: true,
              achievements: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.expertProfile.count({ where })
    ])

    // Add rank to each expert based on reputation points
    const expertsWithRank = experts.map((expert, index) => ({
      ...expert,
      rank: skip + index + 1
    }))

    return NextResponse.json({
      experts: expertsWithRank,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Experts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch experts' }, { status: 500 })
  }
}

// POST /api/experts - Create or update expert profile
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthAndGetUser(request)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    
    const user = authResult.user

    const body = await request.json()
    const {
      linkedinUrl,
      githubUrl,
      twitterHandle,
      company,
      position,
      yearsExperience,
      bio,
      primaryExpertise,
      secondaryExpertise
    } = body

    // Check if expert profile already exists
    const existingProfile = await prisma.expertProfile.findUnique({
      where: { userId: user.id }
    })

    let expertProfile

    if (existingProfile) {
      // Update existing profile
      expertProfile = await prisma.expertProfile.update({
        where: { userId: user.id },
        data: {
          linkedinUrl,
          githubUrl,
          twitterHandle,
          company,
          position,
          yearsExperience,
          bio,
          primaryExpertise: primaryExpertise ? JSON.stringify(primaryExpertise) : null,
          secondaryExpertise: secondaryExpertise ? JSON.stringify(secondaryExpertise) : null,
          verificationStatus: 'PENDING' // Reset to pending on profile update
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    } else {
      // Create new profile
      expertProfile = await prisma.expertProfile.create({
        data: {
          userId: user.id,
          linkedinUrl,
          githubUrl,
          twitterHandle,
          company,
          position,
          yearsExperience,
          bio,
          primaryExpertise: primaryExpertise ? JSON.stringify(primaryExpertise) : null,
          secondaryExpertise: secondaryExpertise ? JSON.stringify(secondaryExpertise) : null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    }

    return NextResponse.json({ 
      message: existingProfile ? 'Expert profile updated successfully' : 'Expert profile created successfully',
      expertProfile 
    })

  } catch (error) {
    console.error('Expert profile creation/update error:', error)
    return NextResponse.json({ error: 'Failed to save expert profile' }, { status: 500 })
  }
}