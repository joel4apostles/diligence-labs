import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    // Get subscription statistics
    const [
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      trialingSubscriptions,
      pastDueSubscriptions,
      monthlyRevenue,
      totalRevenue
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.subscription.count({
        where: { status: 'CANCELED' }
      }),
      prisma.subscription.count({
        where: { status: 'TRIALING' }
      }),
      prisma.subscription.count({
        where: { status: 'PAST_DUE' }
      }),
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          billingCycle: 'MONTHLY'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.subscription.aggregate({
        where: {
          status: { in: ['ACTIVE', 'TRIALING'] }
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Get recent subscriptions with user info
    const recentSubscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    })

    // Get subscription breakdown by plan
    const planBreakdown = await prisma.subscription.groupBy({
      by: ['planType', 'status'],
      _count: {
        id: true
      },
      where: {
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] }
      }
    })

    // Get users with subscriptions
    const subscribedUsers = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            status: { in: ['ACTIVE', 'TRIALING'] }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscriptions: {
          where: {
            status: { in: ['ACTIVE', 'TRIALING'] }
          },
          select: {
            id: true,
            planType: true,
            status: true,
            amount: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      stats: {
        totalSubscriptions,
        activeSubscriptions,
        canceledSubscriptions,
        trialingSubscriptions,
        pastDueSubscriptions,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recentSubscriptions,
      planBreakdown,
      subscribedUsers
    })

  } catch (error) {
    console.error("Failed to fetch subscription data:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    )
  }
}