import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    // Get fraud prevention statistics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Get IP address patterns
    const ipActivityQuery = await prisma.session.groupBy({
      by: ['clientIpAddress'],
      where: {
        isFreeConsultation: true,
        clientIpAddress: { not: null },
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get suspicious IPs (more than 1 free consultation)
    const suspiciousIPs = ipActivityQuery.filter(ip => ip._count.id > 1)

    // Get recent free consultations with client info
    const recentFreeConsultations = await prisma.session.findMany({
      where: {
        isFreeConsultation: true,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        guestEmail: true,
        guestName: true,
        clientIpAddress: true,
        createdAt: true,
        consultationType: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Get fraud prevention stats
    const [
      totalFreeConsultations,
      totalGuestSessions,
      totalUniqueIPs,
      suspiciousSessionsCount,
      emailDuplicates
    ] = await Promise.all([
      prisma.session.count({
        where: { isFreeConsultation: true }
      }),
      prisma.session.count({
        where: { guestEmail: { not: null } }
      }),
      prisma.session.groupBy({
        by: ['clientIpAddress'],
        where: {
          clientIpAddress: { not: null },
          isFreeConsultation: true
        }
      }).then(results => results.length),
      prisma.session.count({
        where: {
          isFreeConsultation: true,
          clientIpAddress: {
            in: suspiciousIPs.map(ip => ip.clientIpAddress).filter(Boolean) as string[]
          }
        }
      }),
      prisma.session.groupBy({
        by: ['guestEmail'],
        where: {
          isFreeConsultation: true,
          guestEmail: { not: null }
        },
        _count: {
          id: true
        }
      }).then(results => results.filter(email => email._count.id > 1).length)
    ])

    // Get email patterns
    const emailDuplicateDetails = await prisma.session.groupBy({
      by: ['guestEmail'],
      where: {
        isFreeConsultation: true,
        guestEmail: { not: null }
      },
      _count: {
        id: true
      },
      having: {
        id: { _count: { gt: 1 } }
      }
    })

    return NextResponse.json({
      stats: {
        totalFreeConsultations,
        totalGuestSessions,
        totalUniqueIPs,
        suspiciousSessionsCount,
        emailDuplicates
      },
      suspiciousActivity: {
        suspiciousIPs: suspiciousIPs.map(ip => ({
          ipAddress: ip.clientIpAddress,
          freeConsultationCount: ip._count.id
        })),
        emailDuplicates: emailDuplicateDetails.map(email => ({
          email: email.guestEmail,
          consultationCount: email._count.id
        }))
      },
      recentActivity: recentFreeConsultations
    })

  } catch (error) {
    console.error("Failed to fetch fraud monitoring data:", error)
    return NextResponse.json(
      { error: "Failed to fetch fraud monitoring data" },
      { status: 500 }
    )
  }
}