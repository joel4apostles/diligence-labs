"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useUnifiedAuth } from "@/components/providers/unified-auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Wallet,
  FileText,
  TrendingUp,
  Bell,
  Shield,
  Zap,
  Crown
} from "lucide-react"

export default function Dashboard() {
  const { data: session, status, update } = useSession()
  const { user: unifiedUser, isLoading: unifiedLoading, isAuthenticated, logout } = useUnifiedAuth()
  const router = useRouter()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedReports: 0,
    pendingReports: 0
  })
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [forceShowDashboard, setForceShowDashboard] = useState(true) // Force show for now since backend auth works

  const fetchDashboardData = useCallback(async () => {
    // Try to fetch data regardless of session state for debugging
    console.log('Attempting to fetch dashboard data...', { 
      hasSession: !!session?.user, 
      sessionId: session?.user?.id,
      status 
    })
    
    try {
      setIsLoadingStats(true)
      
      // Fetch dashboard stats with retry logic
      try {
        const statsResponse = await fetch('/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log('Dashboard stats received:', statsData)
          setDashboardStats(statsData)
        } else {
          console.warn('Failed to fetch dashboard stats:', statsResponse.status)
          // Keep default stats on error
        }
      } catch (statsError) {
        console.warn('Dashboard stats API error:', statsError instanceof Error ? statsError.message : 'Unknown error')
        // Keep default stats on error
      }

      // Fetch subscription data with retry logic
      try {
        const subscriptionResponse = await fetch('/api/subscriptions/manage')
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json()
          setSubscriptionData(subscriptionData.subscription)
        } else {
          console.warn('Failed to fetch subscription data:', subscriptionResponse.status)
          // Keep null subscription data on error
        }
      } catch (subscriptionError) {
        console.warn('Subscription API error:', subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error')
        // Keep null subscription data on error
      }
      
    } catch (error) {
      console.warn("Dashboard data fetch error:", error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoadingStats(false)
      console.log('Dashboard loading completed. Final stats:', {
        isLoadingStats: false,
        dashboardStats
      })
    }
  }, [session])

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { status, hasSession: !!session?.user })
    
    // Always try to fetch data for debugging - regardless of auth status
    fetchDashboardData()
    setIsPageLoaded(true)
    
    // Still handle redirects properly
    if (status === "unauthenticated") {
      console.log('User not authenticated, redirecting to login')
      setTimeout(() => router.push("/auth/unified-signin"), 2000) // Delay redirect for debugging
    }
  }, [session, status, router, fetchDashboardData])

  // Debug logging
  console.log('Dashboard render state:', {
    isLoadingStats,
    dashboardStats,
    session: !!session?.user,
    status
  })

  // Enhanced loading states - show loading while auth is being determined
  // Temporarily comment out to debug
  if (false && status === "loading") {
    return (
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
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-gray-800/50 rounded-lg w-96 animate-pulse"></div>
              <div className="h-6 bg-gray-800/50 rounded-lg w-80 animate-pulse"></div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
            
            {/* Main Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced error states - redirect if not authenticated  
  // Only redirect if explicitly unauthenticated AND we haven't forced dashboard display
  if (status === "unauthenticated" && !session?.user && !forceShowDashboard) {
    return (
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
          <div className="text-center py-16">
            <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to access your dashboard</p>
            <Link href="/auth/unified-signin">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
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
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light mb-3">
                Welcome back, <span className="font-normal bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  {unifiedUser?.name || session?.user?.name || 'User'}
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                Manage your blockchain consulting services, track sessions, and access expert advisory resources.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                onClick={() => logout()} 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscriptionData && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/30 backdrop-blur-xl border border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Crown className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {subscriptionData.planType?.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Free'} Plan
                      </h3>
                      <p className="text-sm text-gray-400">
                        Status: <span className="text-green-400 font-medium">{subscriptionData.status || 'Active'}</span>
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400">
                      Manage Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Banner for Free Users */}
        {(!subscriptionData || subscriptionData.planType === 'FREE') && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-purple-900/60 to-pink-800/30 backdrop-blur-xl border border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Unlock Premium Features</h3>
                      <p className="text-sm text-gray-400">
                        Upgrade to access unlimited consultations, priority support, and advanced analytics
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/upgrade">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoadingStats ? '--' : dashboardStats.totalSessions || 'N/A'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Upcoming</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoadingStats ? '--' : dashboardStats.upcomingSessions}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Completed Reports</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoadingStats ? '--' : dashboardStats.completedReports}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Pending Reports</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoadingStats ? '--' : dashboardStats.pendingReports}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Book Consultation */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                  Priority
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-blue-100 transition-colors duration-300 mb-2">
                Book Consultation
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Schedule personalized blockchain strategy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Get expert guidance on blockchain strategy, token launches, smart contracts, and technology decisions.
                </p>
              </div>
              <Link href="/dashboard/book-consultation" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 h-12">
                  Schedule Session
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* My Sessions */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-purple-100 transition-colors duration-300 mb-2">
                My Sessions
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Track and manage your consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Access session notes, recordings, action items, and follow-up recommendations.
                </p>
              </div>
              <Link href="/dashboard/sessions" className="w-full">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-500 transition-all duration-300 h-12">
                  View Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Reports & Analytics */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <BarChart3 className="w-8 h-8 text-green-400" />
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                  Ready
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-green-100 transition-colors duration-300 mb-2">
                Reports & Analytics
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Due diligence & market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Access comprehensive reports, market analysis, and technical assessments.
                </p>
              </div>
              <Link href="/dashboard/reports" className="w-full">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-500 transition-all duration-300 h-12">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Settings className="w-8 h-8 text-orange-400" />
                </div>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                  Settings
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-orange-100 transition-colors duration-300 mb-2">
                Profile Settings
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Update profile information, change password, manage wallet connections.
                </p>
              </div>
              <Link href="/dashboard/profile" className="w-full">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-500 transition-all duration-300 h-12">
                  Manage Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Wallet Management */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-teal-500/30 border border-cyan-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Wallet className="w-8 h-8 text-cyan-400" />
                </div>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                  Crypto
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-cyan-100 transition-colors duration-300 mb-2">
                Wallet Connection
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Connect your crypto wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Connect MetaMask, WalletConnect, and other wallets for seamless payments.
                </p>
              </div>
              <Link href="/dashboard/wallet" className="w-full">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-500 transition-all duration-300 h-12">
                  Manage Wallets
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <CreditCard className="w-8 h-8 text-yellow-400" />
                </div>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                  Billing
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-yellow-100 transition-colors duration-300 mb-2">
                Subscription
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Manage your billing and plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  View billing history, upgrade plans, and manage payment methods.
                </p>
              </div>
              <Link href="/dashboard/subscription" className="w-full">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-500 transition-all duration-300 h-12">
                  Manage Subscription
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}