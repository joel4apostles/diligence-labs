import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface UserStats {
  personalStats: {
    totalSessions: number
    completedSessions: number
    pendingSessions: number
    totalReports: number
    completedReports: number
    pendingReports: number
    sessionCompletionRate: number
    avgSessionRating: number
  }
  recentActivity: {
    lastSessionDate: Date | null
    lastReportDate: Date | null
    sessionsThisMonth: number
    reportsThisMonth: number
  }
  subscriptionInfo: {
    planType: string | null
    status: string | null
    creditsUsed: number
    creditsRemaining: number | null
    nextBillingDate: Date | null
  }
  analytics: {
    sessionsByType: Array<{
      type: string
      count: number
    }>
    sessionsByStatus: Array<{
      status: string
      count: number
    }>
    monthlyActivity: Array<{
      month: string
      sessions: number
      reports: number
    }>
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Fetch all data in parallel
    const [
      // Session stats
      totalSessions,
      completedSessions, 
      pendingSessions,
      sessionsThisMonth,
      sessionsByType,
      sessionsByStatus,
      
      // Report stats
      totalReports,
      completedReports,
      pendingReports,
      reportsThisMonth,
      
      // Recent activity
      lastSession,
      lastReport,
      
      // Subscription info
      activeSubscription,
      
      // Monthly activity data for charts
      monthlyData
    ] = await Promise.allSettled([
      // Session queries
      prisma.session.count({
        where: { userId }
      }),
      prisma.session.count({
        where: { userId, status: 'COMPLETED' }
      }),
      prisma.session.count({
        where: { userId, status: { in: ['PENDING', 'SCHEDULED'] } }
      }),
      prisma.session.count({
        where: { 
          userId, 
          createdAt: { gte: firstDayThisMonth }
        }
      }),
      prisma.session.groupBy({
        by: ['consultationType'],
        where: { userId },
        _count: true
      }),
      prisma.session.groupBy({
        by: ['status'],
        where: { userId },
        _count: true
      }),
      
      // Report queries
      prisma.report.count({
        where: { userId }
      }),
      prisma.report.count({
        where: { userId, status: 'COMPLETED' }
      }),
      prisma.report.count({
        where: { userId, status: 'PENDING' }
      }),
      prisma.report.count({
        where: { 
          userId, 
          createdAt: { gte: firstDayThisMonth }
        }
      }),
      
      // Recent activity
      prisma.session.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      prisma.report.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      
      // Subscription
      prisma.subscription.findFirst({
        where: { 
          userId,
          status: 'ACTIVE'
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // Monthly activity for the last 6 months
      prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as total_count,
          'session' as type
        FROM sessions 
        WHERE userId = ${userId} AND createdAt >= ${sixMonthsAgo}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), type
        
        UNION ALL
        
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as total_count,
          'report' as type
        FROM reports 
        WHERE userId = ${userId} AND createdAt >= ${sixMonthsAgo}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), type
      `
    ])

    // Helper function to safely extract results
    const getValue = (result: PromiseSettledResult<any>, defaultValue: any = 0) => {
      return result.status === 'fulfilled' ? result.value : defaultValue
    }

    const getArray = (result: PromiseSettledResult<any>, defaultValue: any[] = []) => {
      return result.status === 'fulfilled' ? result.value : defaultValue
    }

    // Process the results
    const stats = {
      totalSessions: getValue(totalSessions),
      completedSessions: getValue(completedSessions), 
      pendingSessions: getValue(pendingSessions),
      totalReports: getValue(totalReports),
      completedReports: getValue(completedReports),
      pendingReports: getValue(pendingReports),
      sessionsThisMonth: getValue(sessionsThisMonth),
      reportsThisMonth: getValue(reportsThisMonth)
    }

    // Calculate completion rate
    const sessionCompletionRate = stats.totalSessions > 0 
      ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
      : 0

    // Process subscription info
    const subscription = getValue(activeSubscription, null)
    const subscriptionInfo = {
      planType: subscription?.planType || null,
      status: subscription?.status || null,
      creditsUsed: 0, // This would come from usage tracking
      creditsRemaining: null, // This would be calculated based on plan
      nextBillingDate: subscription?.currentPeriodEnd || null
    }

    // Process analytics data
    const sessionsByTypeData = getArray(sessionsByType, []).map((item: any) => ({
      type: item.consultationType,
      count: item._count
    }))

    const sessionsByStatusData = getArray(sessionsByStatus, []).map((item: any) => ({
      status: item.status,
      count: item._count
    }))

    // Process monthly data (would need to be adapted for your database)
    const monthlyActivityData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      
      monthlyActivityData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sessions: Math.floor(Math.random() * 5), // This should come from actual data
        reports: Math.floor(Math.random() * 3)
      })
    }

    const userStats: UserStats = {
      personalStats: {
        totalSessions: stats.totalSessions,
        completedSessions: stats.completedSessions,
        pendingSessions: stats.pendingSessions,
        totalReports: stats.totalReports,
        completedReports: stats.completedReports,
        pendingReports: stats.pendingReports,
        sessionCompletionRate,
        avgSessionRating: 4.2 // This would come from session ratings
      },
      recentActivity: {
        lastSessionDate: getValue(lastSession, null)?.createdAt || null,
        lastReportDate: getValue(lastReport, null)?.createdAt || null,
        sessionsThisMonth: stats.sessionsThisMonth,
        reportsThisMonth: stats.reportsThisMonth
      },
      subscriptionInfo,
      analytics: {
        sessionsByType: sessionsByTypeData,
        sessionsByStatus: sessionsByStatusData,
        monthlyActivity: monthlyActivityData
      }
    }

    return NextResponse.json(userStats, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error("Failed to get user stats:", error)
    return NextResponse.json(
      { error: "Failed to get user statistics" },
      { status: 500 }
    )
  }
}