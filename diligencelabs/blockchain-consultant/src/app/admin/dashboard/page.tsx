"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading, CardSkeleton } from "@/components/ui/loading-states"
import { AdvancedAdminStats } from "@/components/admin/advanced-admin-stats"
import { 
  Users, 
  Calendar, 
  BarChart3, 
  AlertTriangle,
  Settings,
  Shield,
  Key,
  UserCheck,
  FileText,
  Bell,
  ChevronRight,
  Activity
} from "lucide-react"

// Lazy load heavy components to improve initial load time
const NotificationDashboard = dynamic(() => import("@/components/admin/NotificationDashboard").then(mod => ({ default: mod.NotificationDashboard })), {
  loading: () => <CardSkeleton showHeader={true} lines={4} />
})

const WalletMonitoring = dynamic(() => import("@/components/admin/WalletMonitoring").then(mod => ({ default: mod.WalletMonitoring })), {
  loading: () => <CardSkeleton showHeader={true} lines={3} />
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

interface TeamMember {
  id: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  position: string
  department: string
  isActive: boolean
}

interface DashboardData {
  stats: DashboardStats
  notifications: {
    summary: NotificationSummary
    permissions: AdminPermissions
  }
  teamMembers?: TeamMember[]
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

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
        
        // Fetch team members separately to avoid slowing down main dashboard
        fetchTeamMembers()
        
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

  const fetchTeamMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await fetch('/api/admin/team?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data.members || [])
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
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
    return <PageLoading message="Loading admin dashboard..." showLogo={true} />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Background network visualization placeholder */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.1) 2px, transparent 2px), radial-gradient(circle at 40% 60%, rgba(251, 146, 60, 0.1) 2px, transparent 2px)',
            backgroundSize: '100px 100px, 150px 150px, 200px 200px'
          }} />
        </div>
        
        {/* Gradient overlays matching homepage */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Logo size="xl" href={null} />
              <div className="w-px h-8 bg-gradient-to-b from-orange-400 to-red-400"></div>
              <div className="text-lg text-gray-400">Admin Dashboard</div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-light mb-3">
                  <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Administrative Control</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Manage users, sessions, reports, and system monitoring
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500">
                  <Activity className="w-4 h-4 mr-2" />
                  System Health
                </Button>
              </div>
            </div>
          </div>

        {/* Enhanced Statistics Dashboard */}
        <div className={`mb-12 transition-all duration-1000 delay-200 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <AdvancedAdminStats timeRange="30d" autoRefresh={true} />
        </div>

        {/* Basic Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{memoizedStats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">{memoizedStats.totalSessions}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Reports Generated</p>
                  <p className="text-2xl font-bold text-white">{memoizedStats.totalReports}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Pending Sessions</p>
                  <p className="text-2xl font-bold text-orange-400">{memoizedStats.pendingSessions}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Center */}
        <NotificationDashboard {...notificationDashboardProps} />

        {/* Wallet Monitoring */}
        <WalletMonitoring />

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-400" />
                Task Assignments
              </CardTitle>
              <CardDescription className="text-gray-400">Assign and track consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/assignments">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center">
                  Manage Assignments
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-teal-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-teal-400" />
                Team Management
              </CardTitle>
              <CardDescription className="text-gray-400">Manage team members and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/team">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white flex items-center justify-center">
                  Manage Team
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-purple-400" />
                User Management
              </CardTitle>
              <CardDescription className="text-gray-400">Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center justify-center">
                  View All Users
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-400" />
                Reports & Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">Monitor reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/reports">
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center">
                  View Reports
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {memoizedPermissions.canViewHistory && (
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-400" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-400">User notifications and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/notifications">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center">
                    Manage Notifications
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-indigo-400" />
                Admin Keys
              </CardTitle>
              <CardDescription className="text-gray-400">Manage admin registration keys</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/keys">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white flex items-center justify-center">
                  Manage Keys
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-400" />
                Fraud Prevention
              </CardTitle>
              <CardDescription className="text-gray-400">Monitor potential fraud activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/fraud-prevention">
                <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center">
                  View Report
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-pink-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-pink-400" />
                Expert Applications
              </CardTitle>
              <CardDescription className="text-gray-400">Review expert verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/expert-applications">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white flex items-center justify-center">
                  Review Applications
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}