import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    // Get admin dashboard statistics
    const [
      totalUsers,
      totalSessions,
      totalReports,
      pendingSessions,
      adminUsers,
      verifiedUsers,
      freeConsultationsUsed,
      freeConsultationSessions,
      guestSessions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.report.count(),
      prisma.session.count({
        where: { status: 'PENDING' }
      }),
      prisma.user.count({
        where: { role: 'ADMIN' }
      }),
      prisma.user.count({
        where: { emailVerified: { not: null } }
      }),
      prisma.user.count({
        where: { freeConsultationUsed: true }
      }),
      prisma.session.count({
        where: { isFreeConsultation: true }
      }),
      prisma.session.count({
        where: { guestEmail: { not: null } }
      })
    ])

    // Get recent activity
    const recentSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })

    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { email: true, name: true, createdAt: true }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSessions,
        totalReports,
        pendingSessions,
        adminUsers,
        verifiedUsers,
        freeConsultationsUsed,
        freeConsultationSessions,
        guestSessions
      },
      recentActivity: {
        sessions: recentSessions,
        users: recentUsers
      }
    })

  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    )
  }
}