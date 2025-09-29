import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/db-test - Test database connection and table existence
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    const tests = {
      userTable: false,
      subscriptionTable: false,
      sessionTable: false,
      reportTable: false,
      userCount: 0,
      subscriptionCount: 0,
      sessionCount: 0,
      reportCount: 0,
      adminUserCount: 0,
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
    
    // Test other key tables
    try {
      const subscriptionCount = await prisma.subscription.count()
      tests.subscriptionTable = true
      tests.subscriptionCount = subscriptionCount
      console.log(`Subscription table exists with ${subscriptionCount} records`)
    } catch (error) {
      console.log('Subscription table error:', error)
      tests.error = `Subscription table: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    try {
      const sessionCount = await prisma.session.count()
      tests.sessionCount = sessionCount
      console.log(`Session table exists with ${sessionCount} records`)
    } catch (error) {
      console.log('Session table error:', error)
    }
    
    try {
      const reportCount = await prisma.report.count()
      tests.reportCount = reportCount
      console.log(`Report table exists with ${reportCount} records`)
    } catch (error) {
      console.log('Report table error:', error)
    }
    
    try {
      const adminUserCount = await prisma.adminUser.count()
      tests.adminUserCount = adminUserCount
      console.log(`AdminUser table exists with ${adminUserCount} records`)
    } catch (error) {
      console.log('AdminUser table error:', error)
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