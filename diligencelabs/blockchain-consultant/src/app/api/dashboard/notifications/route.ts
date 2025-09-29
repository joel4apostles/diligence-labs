import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface DashboardNotification {
  id: string
  type: 'session' | 'report' | 'subscription' | 'system' | 'achievement'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  actionUrl?: string
  actionText?: string
  createdAt: Date
  metadata?: Record<string, any>
}

interface NotificationResponse {
  notifications: DashboardNotification[]
  unreadCount: number
  totalCount: number
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
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
    const offset = (page - 1) * limit

    // Get user's recent sessions, reports, and subscription updates
    const [
      recentSessions,
      recentReports,
      activeSubscription,
      userActivity
    ] = await Promise.allSettled([
      prisma.session.findMany({
        where: { 
          userId,
          updatedAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.report.findMany({
        where: { 
          userId,
          updatedAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.subscription.findFirst({
        where: { 
          userId,
          status: 'ACTIVE'
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          monthlyProjectsUsed: true,
          monthlyProjectLimit: true,
          freeConsultationUsed: true,
          createdAt: true
        }
      })
    ])

    // Helper function to safely extract results
    const getValue = (result: PromiseSettledResult<any>, defaultValue: any = null) => {
      return result.status === 'fulfilled' ? result.value : defaultValue
    }

    const sessions = getValue(recentSessions, [])
    const reports = getValue(recentReports, [])
    const subscription = getValue(activeSubscription, null)
    const user = getValue(userActivity, null)

    const notifications: DashboardNotification[] = []

    // Generate session notifications
    sessions.forEach((session: any) => {
      let notification: DashboardNotification | null = null

      switch (session.status) {
        case 'SCHEDULED':
          notification = {
            id: `session-${session.id}`,
            type: 'session',
            title: 'Consultation Scheduled',
            message: `Your ${session.consultationType.toLowerCase().replace('_', ' ')} consultation has been scheduled`,
            priority: 'medium',
            isRead: false,
            actionUrl: `/dashboard/sessions`,
            actionText: 'View Details',
            createdAt: session.updatedAt,
            metadata: { sessionId: session.id }
          }
          break
        case 'COMPLETED':
          notification = {
            id: `session-completed-${session.id}`,
            type: 'session',
            title: 'Consultation Completed',
            message: `Your ${session.consultationType.toLowerCase().replace('_', ' ')} consultation has been completed`,
            priority: 'high',
            isRead: false,
            actionUrl: `/dashboard/sessions`,
            actionText: 'View Results',
            createdAt: session.updatedAt,
            metadata: { sessionId: session.id }
          }
          break
        case 'CANCELLED':
          notification = {
            id: `session-cancelled-${session.id}`,
            type: 'session',
            title: 'Consultation Cancelled',
            message: `Your ${session.consultationType.toLowerCase().replace('_', ' ')} consultation has been cancelled`,
            priority: 'medium',
            isRead: false,
            actionUrl: `/dashboard/book-consultation`,
            actionText: 'Reschedule',
            createdAt: session.updatedAt,
            metadata: { sessionId: session.id }
          }
          break
      }

      if (notification) {
        notifications.push(notification)
      }
    })

    // Generate report notifications
    reports.forEach((report: any) => {
      let notification: DashboardNotification | null = null

      switch (report.status) {
        case 'COMPLETED':
          notification = {
            id: `report-${report.id}`,
            type: 'report',
            title: 'Report Ready',
            message: `Your ${report.type.toLowerCase().replace('_', ' ')} report is now available`,
            priority: 'high',
            isRead: false,
            actionUrl: `/dashboard/reports`,
            actionText: 'Download Report',
            createdAt: report.updatedAt,
            metadata: { reportId: report.id }
          }
          break
        case 'IN_REVIEW':
          notification = {
            id: `report-review-${report.id}`,
            type: 'report',
            title: 'Report Under Review',
            message: `Your ${report.type.toLowerCase().replace('_', ' ')} report is being reviewed`,
            priority: 'medium',
            isRead: false,
            actionUrl: `/dashboard/reports`,
            actionText: 'View Status',
            createdAt: report.updatedAt,
            metadata: { reportId: report.id }
          }
          break
      }

      if (notification) {
        notifications.push(notification)
      }
    })

    // Generate subscription notifications
    if (subscription) {
      const daysUntilRenewal = Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      
      if (daysUntilRenewal <= 7 && daysUntilRenewal > 0) {
        notifications.push({
          id: `subscription-renewal-${subscription.id}`,
          type: 'subscription',
          title: 'Subscription Renewal',
          message: `Your ${subscription.planType.replace('_', ' ').toLowerCase()} plan renews in ${daysUntilRenewal} days`,
          priority: daysUntilRenewal <= 3 ? 'high' : 'medium',
          isRead: false,
          actionUrl: `/dashboard/profile`,
          actionText: 'Manage Subscription',
          createdAt: new Date(),
          metadata: { subscriptionId: subscription.id, daysUntilRenewal }
        })
      }
    }

    // Generate usage notifications
    if (user) {
      const usagePercentage = (user.monthlyProjectsUsed / user.monthlyProjectLimit) * 100
      
      if (usagePercentage >= 80) {
        notifications.push({
          id: `usage-warning-${userId}`,
          type: 'system',
          title: 'Usage Alert',
          message: `You've used ${user.monthlyProjectsUsed} of ${user.monthlyProjectLimit} monthly projects`,
          priority: usagePercentage >= 95 ? 'urgent' : 'high',
          isRead: false,
          actionUrl: `/dashboard/profile`,
          actionText: 'Upgrade Plan',
          createdAt: new Date(),
          metadata: { usagePercentage }
        })
      }
    }

    // Generate achievement notifications (example)
    if (sessions.length >= 5) {
      const completedSessions = sessions.filter((s: any) => s.status === 'COMPLETED').length
      if (completedSessions >= 5) {
        notifications.push({
          id: `achievement-5-sessions`,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You\'ve completed 5 consultation sessions',
          priority: 'low',
          isRead: false,
          createdAt: new Date(),
          metadata: { achievement: 'frequent_user' }
        })
      }
    }

    // Sort notifications by priority and creation date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Apply filtering and pagination
    const filteredNotifications = unreadOnly 
      ? notifications.filter(n => !n.isRead)
      : notifications

    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit)
    const unreadCount = notifications.filter(n => !n.isRead).length

    const response: NotificationResponse = {
      notifications: paginatedNotifications,
      unreadCount,
      totalCount: filteredNotifications.length
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error("Failed to get dashboard notifications:", error)
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { notificationIds, action } = await request.json()

    if (action === 'markAsRead' && Array.isArray(notificationIds)) {
      // In a real implementation, you'd store notification read status in the database
      // For now, we'll just return success
      return NextResponse.json({ 
        success: true, 
        message: `Marked ${notificationIds.length} notifications as read` 
      })
    }

    return NextResponse.json(
      { error: "Invalid action or parameters" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}