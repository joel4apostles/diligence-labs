import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get dashboard statistics
    const [
      totalSessions,
      upcomingSessions,
      completedReports,
      pendingReports
    ] = await Promise.all([
      // Total sessions count
      prisma.session.count({
        where: { userId }
      }),
      // Upcoming sessions count
      prisma.session.count({
        where: { 
          userId,
          status: {
            in: ['PENDING', 'SCHEDULED']
          }
        }
      }),
      // Completed reports count
      prisma.report.count({
        where: { 
          userId,
          status: 'COMPLETED'
        }
      }),
      // Pending reports count
      prisma.report.count({
        where: { 
          userId,
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        }
      })
    ])

    const stats = {
      totalSessions,
      upcomingSessions,
      completedReports,
      pendingReports
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}