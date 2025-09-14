import { NextResponse } from "next/server"
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET - Get notification history
export async function GET(request: Request) {
  try {
    // MODERATOR and above can view notification history
    const adminData = verifyAdminPermission(request, 'MODERATOR')
    
    if (!adminData) {
      return forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const notificationType = searchParams.get('type')
    const offset = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (notificationType) {
      whereClause.notificationType = notificationType
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.adminNotificationLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          admin: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.adminNotificationLog.count({ where: whereClause })
    ])

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      notificationType: notification.notificationType,
      emailSent: notification.emailSent,
      details: notification.details ? JSON.parse(notification.details) : null,
      createdAt: notification.createdAt,
      user: notification.user,
      admin: notification.admin
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      notifications: formattedNotifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages
      },
      summary: {
        totalNotifications: totalCount,
        byType: await getNotificationStats(whereClause)
      }
    })

  } catch (error) {
    console.error("Failed to get notification history:", error)
    return NextResponse.json(
      { error: "Failed to get notification history" },
      { status: 500 }
    )
  }
}

async function getNotificationStats(baseWhere: any) {
  const stats = await prisma.adminNotificationLog.groupBy({
    by: ['notificationType'],
    where: baseWhere,
    _count: {
      id: true
    }
  })

  return stats.reduce((acc, stat) => {
    acc[stat.notificationType] = stat._count.id
    return acc
  }, {} as Record<string, number>)
}