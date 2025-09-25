'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  FileText,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Activity,
  Users,
  CreditCard,
  CheckCircle2
} from 'lucide-react'
import { 
  GlassMorphismCard,
  theme,
  animations
} from '@/components/ui/consistent-theme'

interface UserStats {
  personalStats: {
    totalSessions: number
    completedSessions: number
    pendingSessions: number
    totalReports: number
    completedReports: number
    pendingReports: number
    sessionCompletionRate: number
    avgSessionRating: number
  }
  recentActivity: {
    lastSessionDate: Date | null
    lastReportDate: Date | null
    sessionsThisMonth: number
    reportsThisMonth: number
  }
  subscriptionInfo: {
    planType: string | null
    status: string | null
    creditsUsed: number
    creditsRemaining: number | null
    nextBillingDate: Date | null
  }
  analytics: {
    sessionsByType: Array<{
      type: string
      count: number
    }>
    sessionsByStatus: Array<{
      status: string
      count: number
    }>
    monthlyActivity: Array<{
      month: string
      sessions: number
      reports: number
    }>
  }
}

interface EnhancedDashboardStatsProps {
  userId: string
}

export function EnhancedDashboardStats({ userId }: EnhancedDashboardStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/user-stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error('Error fetching user stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'cancelled':
        return 'text-red-400'
      case 'active':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Activity className="w-4 h-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <GlassMorphismCard variant="neutral">
              <Card className="bg-transparent border-0">
                <CardHeader>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            </GlassMorphismCard>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <GlassMorphismCard variant="neutral">
        <Card className="bg-transparent border-0">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Unable to Load Stats
            </h3>
            <p className="text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={fetchStats} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </GlassMorphismCard>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <GlassMorphismCard variant="primary" hover={true}>
            <Card className="bg-transparent border-0 h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stats.recentActivity.sessionsThisMonth, 0)}
                    <span className="text-xs text-green-400">
                      +{stats.recentActivity.sessionsThisMonth} this month
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg text-white">
                  Total Sessions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Consultation sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {stats.personalStats.totalSessions}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Completed</span>
                      <span className="text-green-400">{stats.personalStats.completedSessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Pending</span>
                      <span className="text-yellow-400">{stats.personalStats.pendingSessions}</span>
                    </div>
                    <Progress 
                      value={stats.personalStats.sessionCompletionRate} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-400">
                      {stats.personalStats.sessionCompletionRate}% completion rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>

        {/* Reports Generated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassMorphismCard variant="secondary" hover={true}>
            <Card className="bg-transparent border-0 h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    New
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white">
                  Reports Generated
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Analysis & documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {stats.personalStats.totalReports}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Completed</span>
                      <span className="text-green-400">{stats.personalStats.completedReports}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">In Progress</span>
                      <span className="text-blue-400">{stats.personalStats.pendingReports}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Last report: {formatDate(stats.recentActivity.lastReportDate)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>

        {/* Performance Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassMorphismCard variant="accent" hover={true}>
            <Card className="bg-transparent border-0 h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {stats.personalStats.avgSessionRating.toFixed(1)}
                  </div>
                </div>
                <CardTitle className="text-lg text-white">
                  Average Rating
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Session satisfaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-4 h-4 ${
                          star <= stats.personalStats.avgSessionRating
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">
                    Based on {stats.personalStats.completedSessions} completed sessions
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <GlassMorphismCard variant="neutral" hover={true}>
            <Card className="bg-transparent border-0 h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(stats.subscriptionInfo.status || 'inactive')} border-current`}
                  >
                    {stats.subscriptionInfo.status || 'Free'}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white">
                  Subscription
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {stats.subscriptionInfo.planType?.replace('_', ' ') || 'Basic Plan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.subscriptionInfo.nextBillingDate && (
                    <div className="text-xs text-gray-400">
                      Renews: {formatDate(stats.subscriptionInfo.nextBillingDate)}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Active & Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>
      </div>

      {/* Activity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <GlassMorphismCard variant="primary" hover={false}>
          <Card className="bg-transparent border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your consultation and report activity
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {stats.recentActivity.sessionsThisMonth}
                  </div>
                  <div className="text-sm text-gray-300 mb-1">Sessions This Month</div>
                  <div className="text-xs text-gray-400">
                    Last: {formatDate(stats.recentActivity.lastSessionDate)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {stats.recentActivity.reportsThisMonth}
                  </div>
                  <div className="text-sm text-gray-300 mb-1">Reports This Month</div>
                  <div className="text-xs text-gray-400">
                    Last: {formatDate(stats.recentActivity.lastReportDate)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {stats.personalStats.sessionCompletionRate}%
                  </div>
                  <div className="text-sm text-gray-300 mb-1">Success Rate</div>
                  <div className="text-xs text-gray-400">
                    Completion percentage
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </GlassMorphismCard>
      </motion.div>
    </div>
  )
}