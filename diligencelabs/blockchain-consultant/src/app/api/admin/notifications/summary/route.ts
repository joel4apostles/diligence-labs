import { NextResponse } from "next/server"
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Test database connection first
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      )
    }

    const adminData = verifyAdminPermission(request, 'MODERATOR')
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    console.log("Fetching notification summary for admin:", adminData.email)

    // Note: AdminNotificationLog model issues - returning mock data
    return NextResponse.json({
      message: 'Notification summary temporarily disabled due to model issues',
      summary: {
        totalNotifications: 0,
        last24Hours: 0,
        last7Days: 0,
        byType: [],
        urgentAlerts: 0,
        expiringSoon: 0
      }
    })

    /* COMMENTED OUT - UNREACHABLE CODE
    // Get notification summary statistics
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Recent notifications count (last 24 hours) - with error handling
    let recentNotifications = 0
    try {
      recentNotifications = await prisma.adminNotificationLog.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        }
      })
    } catch (error) {
      console.warn("Failed to count recent notifications, using 0:", error)
    }

    // Failed notifications (last 7 days) - with error handling
    let failedNotifications = 0
    try {
      failedNotifications = await prisma.adminNotificationLog.count({
        where: {
          emailSent: false,
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })
    } catch (error) {
      console.warn("Failed to count failed notifications, using 0:", error)
    }

    // Upcoming subscription expirations (critical and urgent) - with error handling
    let criticalExpirations = 0
    try {
      criticalExpirations = await prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // Next 3 days
          }
        }
      })
    } catch (error) {
      console.warn("Failed to count critical expirations, using 0:", error)
    }

    let urgentExpirations = 0
    try {
      urgentExpirations = await prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        }
      })
    } catch (error) {
      console.warn("Failed to count urgent expirations, using 0:", error)
    }

    // Users with suspicious activity (multiple failed logins) - with error handling
    let suspiciousUsers = 0
    try {
      suspiciousUsers = await prisma.user.count({
        where: {
          failedLoginAttempts: {
            gte: 3
          },
          lastFailedLogin: {
            gte: sevenDaysAgo
          }
        }
      })
    } catch (error) {
      console.warn("Failed to count suspicious users, using 0:", error)
    }

    // Users with expired subscriptions - with error handling
    let expiredSubscriptions = 0
    try {
      expiredSubscriptions = await prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lt: now
          }
        }
      })
    } catch (error) {
      console.warn("Failed to count expired subscriptions, using 0:", error)
    }

    // Notification stats by type (last 30 days) - with error handling
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    let notificationsByType: any[] = []
    try {
      notificationsByType = await prisma.adminNotificationLog.groupBy({
        by: ['notificationType'],
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        _count: {
          id: true
        }
      })
    } catch (error) {
      console.warn("Failed to fetch notifications by type, using empty array:", error)
    }

    const notificationTypeStats = notificationsByType.reduce((acc, stat) => {
      acc[stat.notificationType] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    console.log("Successfully fetched notification summary")
    
    return NextResponse.json({
      summary: {
        recentNotifications,
        failedNotifications,
        criticalExpirations,
        urgentExpirations,
        suspiciousUsers,
        expiredSubscriptions
      },
      notificationsByType: notificationTypeStats,
      permissions: {
        canSendNotifications: adminData.role === 'SUPER_ADMIN' || adminData.role === 'ADMIN',
        canViewHistory: true,
        canManageUsers: adminData.role === 'SUPER_ADMIN' || adminData.role === 'ADMIN'
      }
    })

  } catch (error) {
    console.error("Failed to get notification summary:", error)
    return NextResponse.json(
      { error: "Failed to get notification summary" },
      { status: 500 }
    )
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error("Failed to get notification summary:", error)
    return NextResponse.json(
      { error: "Failed to get notification summary" },
      { status: 500 }
    )
  }
}