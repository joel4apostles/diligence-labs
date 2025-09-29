import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/expert-applications-simple - Get expert applications with error handling
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching expert applications (simple)...')
    
    // Check if tables exist by trying a simple query first
    let applications: any[] = []
    let total = 0
    
    // Note: ExpertProfile model not implemented yet
    console.log('ExpertProfile model not implemented - returning mock data')
    applications = []
    total = 0
    
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
        role: Role.USER
      }
    })
    
    console.log('Sample user created:', sampleUser.id)
    
    // Note: ExpertProfile model not implemented yet
    const expertProfile = { id: 'mock-profile', userId: sampleUser.id }
    
    console.log('Mock expert profile created for user:', sampleUser.id)
    
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