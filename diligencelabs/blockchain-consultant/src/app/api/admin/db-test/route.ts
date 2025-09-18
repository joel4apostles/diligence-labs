import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/db-test - Test database connection and table existence
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    const tests = {
      userTable: false,
      expertProfileTable: false,
      userCount: 0,
      expertProfileCount: 0,
      error: null as string | null
    }
    
    // Test User table
    try {
      const userCount = await prisma.user.count()
      tests.userTable = true
      tests.userCount = userCount
      console.log(`User table exists with ${userCount} records`)
    } catch (error) {
      console.log('User table error:', error)
      tests.error = `User table: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    // Test ExpertProfile table
    try {
      const expertCount = await prisma.expertProfile.count()
      tests.expertProfileTable = true
      tests.expertProfileCount = expertCount
      console.log(`ExpertProfile table exists with ${expertCount} records`)
    } catch (error) {
      console.log('ExpertProfile table error:', error)
      tests.error = `ExpertProfile table: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    return NextResponse.json({
      message: 'Database test completed',
      tests,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}