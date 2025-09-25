import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RealtimeUpdate {
  type: 'session' | 'report' | 'notification' | 'system'
  data: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface DashboardMetrics {
  quickStats: {
    sessionsToday: number
    reportsGenerated: number
    upcomingMeetings: number
    systemHealth: number
    activeUsers: number
  }
  recentActivity: Array<{
    id: string
    type: 'session' | 'report' | 'user' | 'system'
    message: string
    time: string
    user?: string
    metadata?: any
  }>
  notifications: {
    unreadCount: number
    urgent: number
    recent: Array<{
      id: string
      title: string
      message: string
      type: string
      createdAt: Date
    }>
  }
  systemStatus: {
    apiResponseTime: number
    databaseConnections: number
    uptime: number
    errorRate: number
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
    const url = new URL(request.url)
    const since = url.searchParams.get('since')
    const includeSystem = url.searchParams.get('includeSystem') === 'true'

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Fetch real-time metrics in parallel
    const [
      // Today's stats
      sessionsToday,
      reportsToday,
      upcomingSessions,
      
      // Recent activity
      recentSessions,
      recentReports,
      recentUsers,
      
      // System metrics
      totalActiveUsers,
      systemMetrics,
      
      // Notifications
      unreadNotifications
    ] = await Promise.allSettled([
      // Today's activity
      prisma.session.count({
        where: {
          userId,
          createdAt: { gte: todayStart }
        }
      }),
      
      prisma.report.count({
        where: {
          userId,
          createdAt: { gte: todayStart }
        }
      }),
      
      prisma.session.count({
        where: {
          userId,
          status: { in: ['SCHEDULED', 'PENDING'] },
          scheduledAt: { gte: new Date() }
        }
      }),
      
      // Recent activity
      prisma.session.findMany({
        where: {
          userId,
          updatedAt: { gte: sinceDate }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          consultationType: true,
          updatedAt: true,
          createdAt: true
        }
      }),
      
      prisma.report.findMany({
        where: {
          userId,
          updatedAt: { gte: sinceDate }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          updatedAt: true,
          createdAt: true
        }
      }),
      
      // Recent users (admin only)
      session.user.role === 'ADMIN' ? prisma.user.findMany({
        where: {
          createdAt: { gte: sinceDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          role: true
        }
      }) : Promise.resolve([]),
      
      // System metrics
      includeSystem ? prisma.user.count({
        where: {
          sessions: {
            some: {
              updatedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Active in last hour
            }
          }
        }
      }) : Promise.resolve(0),
      
      // Mock system metrics - in production these would come from monitoring services
      includeSystem ? Promise.resolve({
        apiResponseTime: Math.floor(Math.random() * 200) + 150,
        databaseConnections: Math.floor(Math.random() * 50) + 20,
        uptime: Math.floor(Math.random() * 2) + 99,
        errorRate: Math.random() * 0.5
      }) : Promise.resolve(null),
      
      // Unread notifications
      prisma.adminNotificationLog.findMany({
        where: {
          userId,
          createdAt: { gte: sinceDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Helper function to safely extract results
    const getValue = (result: PromiseSettledResult<any>, defaultValue: any = 0) => {
      return result.status === 'fulfilled' ? result.value : defaultValue
    }

    // Process activity data
    const processedSessions = getValue(recentSessions, []).map((session: any) => ({
      id: session.id,
      type: 'session' as const,
      message: `${session.consultationType.replace('_', ' ')} consultation ${session.status.toLowerCase()}`,
      time: getTimeAgo(session.updatedAt),
      metadata: {
        status: session.status,
        type: session.consultationType
      }
    }))

    const processedReports = getValue(recentReports, []).map((report: any) => ({
      id: report.id,
      type: 'report' as const,
      message: `${report.type.replace('_', ' ')} report ${report.status.toLowerCase()}`,
      time: getTimeAgo(report.updatedAt),
      metadata: {
        status: report.status,
        type: report.type,
        title: report.title
      }
    }))

    const processedUsers = getValue(recentUsers, []).map((user: any) => ({
      id: user.id,
      type: 'user' as const,
      message: `New user registered: ${user.name || user.email}`,
      time: getTimeAgo(user.createdAt),
      user: user.name || user.email.split('@')[0],
      metadata: {
        role: user.role,
        email: user.email
      }
    }))

    // Combine and sort recent activity
    const recentActivity = [
      ...processedSessions,
      ...processedReports,
      ...processedUsers
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15)

    // Build metrics response
    const metrics: DashboardMetrics = {
      quickStats: {
        sessionsToday: getValue(sessionsToday),
        reportsGenerated: getValue(reportsToday),
        upcomingMeetings: getValue(upcomingSessions),
        systemHealth: Math.floor(Math.random() * 5) + 95, // Mock system health
        activeUsers: getValue(totalActiveUsers)
      },
      recentActivity,
      notifications: {
        unreadCount: getValue(unreadNotifications, []).length,
        urgent: getValue(unreadNotifications, []).filter((n: any) => 
          n.notificationType?.includes('critical') || n.notificationType?.includes('urgent')
        ).length,
        recent: getValue(unreadNotifications, []).slice(0, 3).map((notification: any) => ({
          id: notification.id,
          title: notification.notificationType.replace('_', ' ').toUpperCase(),
          message: notification.details ? JSON.parse(notification.details)?.message || 'Notification' : 'System notification',
          type: notification.notificationType,
          createdAt: notification.createdAt
        }))
      },
      systemStatus: getValue(systemMetrics) || {
        apiResponseTime: 0,
        databaseConnections: 0,
        uptime: 0,
        errorRate: 0
      }
    }

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error("Failed to get realtime dashboard updates:", error)
    return NextResponse.json(
      { error: "Failed to get dashboard updates" },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return new Date(date).toLocaleDateString()
}

// WebSocket-like polling endpoint for real-time updates
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { action, data } = await request.json()

    switch (action) {
      case 'markNotificationsRead':
        // Mark notifications as read
        if (data.notificationIds && Array.isArray(data.notificationIds)) {
          // In a full implementation, you'd update notification read status
          return NextResponse.json({ success: true, marked: data.notificationIds.length })
        }
        break

      case 'updatePreferences':
        // Update user dashboard preferences
        if (data.preferences) {
          // Store user preferences for dashboard layout, refresh rates, etc.
          return NextResponse.json({ success: true })
        }
        break

      case 'refreshStats':
        // Force refresh of dashboard statistics
        return NextResponse.json({ success: true, timestamp: new Date() })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Failed to process dashboard action:", error)
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    )
  }
}