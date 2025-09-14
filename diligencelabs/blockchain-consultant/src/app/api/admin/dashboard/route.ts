import { NextResponse } from "next/server"
import { verifyAdminPermission, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// Simple in-memory cache with TTL (5 minutes for dashboard data)
interface CacheEntry {
  data: DashboardData
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(adminId: string): string {
  return `dashboard:${adminId}`
}

function getCachedData(key: string): DashboardData | null {
  const entry = cache.get(key)
  if (!entry) return null
  
  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }
  
  return entry.data
}

function setCachedData(key: string, data: DashboardData, ttl: number = CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

interface DashboardData {
  stats: {
    totalUsers: number
    totalSessions: number
    totalReports: number
    pendingSessions: number
    adminUsers: number
    verifiedUsers: number
  }
  notifications: {
    summary: {
      recentNotifications: number
      failedNotifications: number
      criticalExpirations: number
      urgentExpirations: number
      suspiciousUsers: number
      expiredSubscriptions: number
    }
    permissions: {
      canSendNotifications: boolean
      canViewHistory: boolean
      canManageUsers: boolean
    }
  }
}

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    // Skip database connection test as we pre-connect in development
    // This saves ~50-100ms per request

    const adminData = verifyAdminPermission(request, 'MODERATOR')
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    console.log("Fetching dashboard data for admin:", adminData.email)

    // Check cache first
    const cacheKey = getCacheKey(adminData.adminId)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      const endTime = Date.now()
      console.log(`Dashboard API completed in ${endTime - startTime}ms (HIT)`)
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
          'X-Response-Time': `${endTime - startTime}ms`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    }

    console.log("Cache miss - fetching fresh data")

    // Get all stats and notification data in parallel for maximum performance
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      // Basic stats
      totalUsers,
      totalSessions,
      totalReports,
      pendingSessions,
      adminUsers,
      verifiedUsers,
      
      // Notification stats with error handling
      recentNotifications,
      failedNotifications,
      criticalExpirations,
      urgentExpirations,
      suspiciousUsers,
      expiredSubscriptions
    ] = await Promise.allSettled([
      // Basic stats queries
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
      
      // Notification queries
      prisma.adminNotificationLog.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo }
        }
      }),
      prisma.adminNotificationLog.count({
        where: {
          emailSent: false,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.user.count({
        where: {
          failedLoginAttempts: { gte: 3 },
          lastFailedLogin: { gte: sevenDaysAgo }
        }
      }),
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: { lt: now }
        }
      })
    ])

    // Helper function to safely extract results
    const getValue = (result: PromiseSettledResult<number>, defaultValue: number = 0): number => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.warn('Query failed:', result.reason)
        return defaultValue
      }
    }

    const dashboardData: DashboardData = {
      stats: {
        totalUsers: getValue(totalUsers),
        totalSessions: getValue(totalSessions),
        totalReports: getValue(totalReports),
        pendingSessions: getValue(pendingSessions),
        adminUsers: getValue(adminUsers),
        verifiedUsers: getValue(verifiedUsers)
      },
      notifications: {
        summary: {
          recentNotifications: getValue(recentNotifications),
          failedNotifications: getValue(failedNotifications),
          criticalExpirations: getValue(criticalExpirations),
          urgentExpirations: getValue(urgentExpirations),
          suspiciousUsers: getValue(suspiciousUsers),
          expiredSubscriptions: getValue(expiredSubscriptions)
        },
        permissions: {
          canSendNotifications: adminData.role === 'SUPER_ADMIN' || adminData.role === 'ADMIN',
          canViewHistory: true,
          canManageUsers: adminData.role === 'SUPER_ADMIN' || adminData.role === 'ADMIN'
        }
      }
    }

    console.log("Successfully fetched dashboard data in single request")
    
    // Cache the data
    setCachedData(cacheKey, dashboardData)
    
    const endTime = Date.now()
    console.log(`Dashboard API completed in ${endTime - startTime}ms (MISS)`)
    
    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // Enhanced caching
        'X-Cache': 'MISS',
        'X-Response-Time': `${endTime - startTime}ms`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error("Failed to get dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to get dashboard data" },
      { status: 500 }
    )
  }
}