import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Fetch all user data from database
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        sessions: {
          select: {
            id: true,
            consultationType: true,
            status: true,
            description: true,
            scheduledAt: true,
            completedAt: true,
            createdAt: true,
            guestEmail: true,
            guestName: true,
            guestPhone: true
          }
        },
        reports: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            type: true,
            priority: true,
            complexity: true,
            createdAt: true,
            updatedAt: true,
            deadline: true
          }
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            planType: true,
            billingCycle: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            amount: true,
            currency: true,
            createdAt: true,
            updatedAt: true
          }
        },
        accounts: {
          select: {
            type: true,
            provider: true
          }
        },
        activityLogs: {
          select: {
            action: true,
            details: true,
            ipAddress: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100 // Limit to last 100 activities
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 404 }
      )
    }

    // Remove sensitive data before export
    const exportData = {
      profile: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image,
        role: userData.role,
        walletAddress: userData.walletAddress,
        emailVerified: userData.emailVerified,
        accountStatus: userData.accountStatus,
        freeConsultationUsed: userData.freeConsultationUsed,
        freeConsultationDate: userData.freeConsultationDate,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      sessions: userData.sessions,
      reports: userData.reports,
      subscriptions: userData.subscriptions,
      connectedAccounts: userData.accounts,
      recentActivity: userData.activityLogs,
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email || session.user.id
    }

    // Create JSON response with proper headers for download
    const jsonData = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="diligence-labs-data-${userData.id}-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error("Data download error:", error)
    return NextResponse.json(
      { error: "Failed to download data" },
      { status: 500 }
    )
  }
}