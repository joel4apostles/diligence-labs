import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/expert-applications-simple - Get expert applications with error handling
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching expert applications (simple)...')
    
    // Check if tables exist by trying a simple query first
    let applications = []
    let total = 0
    
    try {
      // Try to fetch ExpertProfile table
      const expertProfiles = await prisma.expertProfile.findMany({
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      applications = expertProfiles
      total = await prisma.expertProfile.count()
      
      console.log(`Found ${applications.length} expert profiles`)
      
    } catch (expertProfileError) {
      console.log('ExpertProfile table issue:', expertProfileError)
      
      // Fallback: create some mock data
      applications = []
      total = 0
    }
    
    // If no expert profiles exist, return empty but valid response
    if (applications.length === 0) {
      console.log('No expert applications found, returning empty response')
      return NextResponse.json({
        applications: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        },
        message: 'No expert applications found. Use "Create Sample Data" to add test applications.'
      })
    }
    
    return NextResponse.json({
      applications,
      pagination: {
        page: 1,
        limit: 10,
        total,
        pages: Math.ceil(total / 10)
      }
    })

  } catch (error) {
    console.error('Expert applications fetch error:', error)
    
    // Return a more detailed error for debugging
    return NextResponse.json({ 
      error: 'Failed to fetch expert applications',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Database tables may not exist. Try running migrations or creating sample data.'
    }, { status: 500 })
  }
}

// POST /api/admin/expert-applications-simple - Create sample expert profiles for testing
export async function POST(request: NextRequest) {
  try {
    console.log('Creating sample expert profiles...')
    
    // Create a simple user first
    const sampleUser = await prisma.user.upsert({
      where: { email: 'sample.expert@example.com' },
      update: {},
      create: {
        email: 'sample.expert@example.com',
        name: 'Sample Expert',
        role: 'USER',
        reputationPoints: 100
      }
    })
    
    console.log('Sample user created:', sampleUser.id)
    
    // Create a simple expert profile
    const expertProfile = await prisma.expertProfile.upsert({
      where: { userId: sampleUser.id },
      update: {},
      create: {
        userId: sampleUser.id,
        verificationStatus: 'PENDING',
        kycStatus: 'PENDING',
        company: 'Sample Blockchain Company',
        position: 'Blockchain Developer',
        yearsExperience: 3,
        bio: 'Sample expert for testing the applications system.',
        primaryExpertise: JSON.stringify(['Blockchain', 'Smart Contracts']),
        reputationPoints: 100,
        expertTier: 'BRONZE',
        totalEvaluations: 0,
        accuracyRate: 0
      }
    })
    
    console.log('Sample expert profile created:', expertProfile.id)
    
    return NextResponse.json({
      message: 'Sample expert profile created successfully',
      user: sampleUser,
      profile: expertProfile
    })
    
  } catch (error) {
    console.error('Create sample expert error:', error)
    return NextResponse.json({ 
      error: 'Failed to create sample expert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}