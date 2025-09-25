import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin users to access analytics
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get session data
    const sessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get user registration data
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        id: true,
        createdAt: true,
        role: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get subscription data
    const subscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        id: true,
        createdAt: true,
        planType: true,
        status: true,
        amount: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Process consultation data by day
    const consultationsByDay = new Map()
    sessions.forEach(session => {
      const date = session.createdAt.toISOString().split('T')[0]
      if (!consultationsByDay.has(date)) {
        consultationsByDay.set(date, {
          date,
          completed: 0,
          scheduled: 0,
          revenue: 0
        })
      }
      
      const dayData = consultationsByDay.get(date)
      if (session.status === 'COMPLETED') {
        dayData.completed++
        // Estimate revenue based on consultation type
        const revenueMap = {
          'STRATEGIC_ADVISORY': 500,
          'DUE_DILIGENCE': 1000,
          'TOKEN_LAUNCH': 2000,
          'TOKENOMICS_DESIGN': 1500
        }
        dayData.revenue += revenueMap[session.consultationType] || 500
      } else if (session.status === 'SCHEDULED') {
        dayData.scheduled++
      }
    })

    // Process service type distribution
    const serviceTypes = {
      'STRATEGIC_ADVISORY': 0,
      'DUE_DILIGENCE': 0,
      'TOKEN_LAUNCH': 0,
      'TOKENOMICS_DESIGN': 0
    }

    sessions.forEach(session => {
      if (serviceTypes.hasOwnProperty(session.consultationType)) {
        serviceTypes[session.consultationType]++
      }
    })

    const serviceTypeData = Object.entries(serviceTypes).map(([key, value]) => ({
      name: key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: {
        'STRATEGIC_ADVISORY': '#3B82F6',
        'DUE_DILIGENCE': '#10B981',
        'TOKEN_LAUNCH': '#F59E0B',
        'TOKENOMICS_DESIGN': '#EF4444'
      }[key] || '#6B7280'
    }))

    // Process user growth by month
    const userGrowthByMonth = new Map()
    users.forEach(user => {
      const month = user.createdAt.toLocaleDateString('en-US', { month: 'short' })
      if (!userGrowthByMonth.has(month)) {
        userGrowthByMonth.set(month, {
          month,
          users: 0,
          subscriptions: 0
        })
      }
      userGrowthByMonth.get(month).users++
    })

    subscriptions.forEach(subscription => {
      const month = subscription.createdAt.toLocaleDateString('en-US', { month: 'short' })
      if (userGrowthByMonth.has(month)) {
        userGrowthByMonth.get(month).subscriptions++
      }
    })

    // Calculate performance metrics
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
    const successRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

    const performance = [
      {
        metric: 'Client Satisfaction',
        value: Math.floor(successRate + Math.random() * 10), // Mock data
        target: 90,
        color: '#10B981'
      },
      {
        metric: 'Project Success Rate',
        value: Math.floor(successRate),
        target: 85,
        color: '#3B82F6'
      },
      {
        metric: 'Time to Delivery',
        value: Math.floor(85 + Math.random() * 15), // Mock data
        target: 90,
        color: '#F59E0B'
      },
      {
        metric: 'Repeat Clients',
        value: Math.floor(70 + Math.random() * 20), // Mock data
        target: 70,
        color: '#8B5CF6'
      }
    ]

    // Calculate summary metrics
    const totalRevenue = Array.from(consultationsByDay.values())
      .reduce((sum, day) => sum + day.revenue, 0)

    const totalConsultations = completedSessions
    const activeClients = new Set(sessions.map(s => s.userId)).size
    
    const analytics = {
      summary: {
        totalRevenue,
        totalConsultations,
        activeClients,
        successRate: Math.round(successRate)
      },
      consultations: Array.from(consultationsByDay.values()),
      serviceTypes: serviceTypeData,
      userGrowth: Array.from(userGrowthByMonth.values()),
      performance,
      timeRange
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}