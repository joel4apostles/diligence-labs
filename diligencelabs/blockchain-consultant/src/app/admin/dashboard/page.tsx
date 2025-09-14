"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { MinimalBackground } from "@/components/ui/minimal-background"
import dynamic from "next/dynamic"

// Lazy load heavy components to improve initial load time
const DynamicPageBackground = dynamic(() => import("@/components/ui/dynamic-page-background").then(mod => ({ default: mod.DynamicPageBackground })), {
  ssr: false, // Don't render on server to speed up initial load
  loading: () => null
})

const PageStructureLines = dynamic(() => import("@/components/ui/page-structure").then(mod => ({ default: mod.PageStructureLines })), {
  ssr: false,
  loading: () => null
})

const NotificationDashboard = dynamic(() => import("@/components/admin/NotificationDashboard").then(mod => ({ default: mod.NotificationDashboard })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-800/50 rounded-xl" />
})

const WalletMonitoring = dynamic(() => import("@/components/admin/WalletMonitoring").then(mod => ({ default: mod.WalletMonitoring })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-800/50 rounded-xl" />
})

const DashboardSkeleton = dynamic(() => import("@/components/admin/DashboardSkeleton").then(mod => ({ default: mod.DashboardSkeleton })), {
  loading: () => <div className="min-h-screen bg-black" />
})

interface DashboardStats {
  totalUsers: number
  totalSessions: number
  totalReports: number
  pendingSessions: number
  adminUsers: number
  verifiedUsers: number
}

interface AdminPermissions {
  canSendNotifications: boolean
  canViewHistory: boolean
  canManageUsers: boolean
}

interface NotificationSummary {
  recentNotifications: number
  failedNotifications: number
  criticalExpirations: number
  urgentExpirations: number
  suspiciousUsers: number
  expiredSubscriptions: number
}

interface DashboardData {
  stats: DashboardStats
  notifications: {
    summary: NotificationSummary
    permissions: AdminPermissions
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSessions: 0,
    totalReports: 0,
    pendingSessions: 0,
    adminUsers: 0,
    verifiedUsers: 0,
  })
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canSendNotifications: false,
    canViewHistory: false,
    canManageUsers: false
  })
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary>({
    recentNotifications: 0,
    failedNotifications: 0,
    criticalExpirations: 0,
    urgentExpirations: 0,
    suspiciousUsers: 0,
    expiredSubscriptions: 0
  })

  useEffect(() => {
    // Set page as loaded immediately for better perceived performance
    setIsPageLoaded(true)
    
    // Fetch data after a tiny delay to allow initial render
    const timeoutId = setTimeout(fetchDashboardData, 10)
    
    return () => clearTimeout(timeoutId)
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.warn("No admin token found")
        setLoading(false)
        return
      }

      console.log("Fetching dashboard data...")
      const startTime = Date.now()

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data: DashboardData = await response.json()
        
        // Update all states in one batch to minimize re-renders
        setStats(data.stats)
        setPermissions(data.notifications.permissions)
        setNotificationSummary(data.notifications.summary)
        
        const endTime = Date.now()
        const cacheStatus = response.headers.get('X-Cache') || 'UNKNOWN'
        console.log(`Dashboard data loaded successfully in ${endTime - startTime}ms (Cache: ${cacheStatus})`)
      } else {
        console.error("Failed to fetch dashboard data:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoize expensive calculations
  const memoizedStats = useMemo(() => stats, [stats])
  const memoizedPermissions = useMemo(() => permissions, [permissions])
  const memoizedNotificationSummary = useMemo(() => notificationSummary, [notificationSummary])

  // Memoize the notification dashboard props to prevent unnecessary re-renders
  const notificationDashboardProps = useMemo(() => ({
    isPageLoaded,
    summary: memoizedNotificationSummary,
    permissions: memoizedPermissions,
    loading
  }), [isPageLoaded, memoizedNotificationSummary, memoizedPermissions, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <MinimalBackground variant="admin" opacity={0.15} />
        <DashboardSkeleton isPageLoaded={isPageLoaded} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Admin Background */}
      <DynamicPageBackground variant="admin" opacity={0.25} />
      <PageStructureLines />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
      <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Diligence Labs
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-orange-400 to-red-400"></div>
            <div className="text-lg text-gray-400">Admin Dashboard</div>
          </div>
          <h1 className="text-4xl font-light mb-2">
            <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Administrative Control</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage clients, sessions, and reports</p>
        </div>
      </div>

      <HorizontalDivider style="subtle" />

      {/* Statistics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{memoizedStats.totalUsers}</div>
              <p className="text-xs text-gray-400">Registered clients</p>
            </CardContent>
          </Card>
        </ProminentBorder>

        <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{memoizedStats.totalSessions}</div>
              <p className="text-xs text-gray-400">Consultation sessions</p>
            </CardContent>
          </Card>
        </ProminentBorder>

        <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Reports Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{memoizedStats.totalReports}</div>
              <p className="text-xs text-gray-400">Analysis reports</p>
            </CardContent>
          </Card>
        </ProminentBorder>

        <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{memoizedStats.pendingSessions}</div>
              <p className="text-xs text-gray-400">Requires attention</p>
            </CardContent>
          </Card>
        </ProminentBorder>
      </div>

      {/* Notification Center */}
      <NotificationDashboard {...notificationDashboardProps} />

      <HorizontalDivider style="subtle" />

      {/* Wallet Monitoring */}
      <WalletMonitoring />

      <HorizontalDivider style="subtle" />

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader>
              <CardTitle className="text-white text-xl">Task Assignments</CardTitle>
              <CardDescription className="text-gray-400">Assign and track reports and consultations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/assignments">
                <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105">Manage Assignments</Button>
              </Link>
            </CardContent>
          </Card>
        </ProminentBorder>

        <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader>
              <CardTitle className="text-white text-xl">Team Management</CardTitle>
              <CardDescription className="text-gray-400">Manage team members, roles, and specializations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/team">
                <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105">Team Overview</Button>
              </Link>
            </CardContent>
          </Card>
        </ProminentBorder>

        <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader>
              <CardTitle className="text-white text-xl">User Management</CardTitle>
              <CardDescription className="text-gray-400">Manage registered users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/users">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105">View All Users</Button>
              </Link>
            </CardContent>
          </Card>
        </ProminentBorder>

        <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader>
              <CardTitle className="text-white text-xl">Reports & Analytics</CardTitle>
              <CardDescription className="text-gray-400">Monitor reports and system analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/reports">
                <Button className="w-full justify-start bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 hover:scale-105">View Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </ProminentBorder>

        {memoizedPermissions.canViewHistory && (
          <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
              <CardHeader>
                <CardTitle className="text-white text-xl">Notification Management</CardTitle>
                <CardDescription className="text-gray-400">Advanced user notifications and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/admin/notifications">
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105">
                    Manage Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </ProminentBorder>
        )}

        <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader>
              <CardTitle className="text-white text-xl">Fraud Prevention</CardTitle>
              <CardDescription className="text-gray-400">Monitor and analyze potential fraud activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/fraud-prevention">
                <Button className="w-full justify-start bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white transition-all duration-300 hover:scale-105">
                  Fraud Prevention Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </ProminentBorder>
      </div>
      </div>
    </div>
  )
}