'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'
import { RealtimeStatusIndicator } from './realtime-status-indicator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LayoutDashboard,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Zap,
  Clock,
  Target
} from 'lucide-react'
import { 
  GlassMorphismCard,
  PageWrapper,
  theme,
  animations,
  staggerContainer,
  staggerItem
} from '@/components/ui/consistent-theme'
import { HorizontalDivider } from '@/components/ui/section-divider'
import { EnhancedDashboardStats } from './enhanced-dashboard-stats'
import { RealtimeNotifications } from './realtime-notifications'
import { InteractiveCharts } from './interactive-charts'
import AIRecommendations from '@/components/smart-dashboard/AIRecommendations'

interface DashboardUser {
  id: string
  name: string | null
  email: string
  role: string
  industry?: string
  experience?: string
  companySize?: string
  budget?: number
}

interface ComprehensiveDashboardProps {
  user: DashboardUser
  isAdmin?: boolean
}

export function ComprehensiveDashboardLayout({ user, isAdmin = false }: ComprehensiveDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  
  // Real-time dashboard hook
  const { 
    metrics, 
    loading: metricsLoading, 
    error: metricsError, 
    lastUpdate, 
    isConnected, 
    refresh 
  } = useRealtimeDashboard({
    refreshInterval: 30000,
    includeSystem: isAdmin,
    autoRefresh: true
  })

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])
  
  // Get current metrics or fallback to defaults
  const dashboardMetrics = metrics || {
    quickStats: {
      sessionsToday: 0,
      reportsGenerated: 0,
      upcomingMeetings: 0,
      systemHealth: 100,
      activeUsers: 0
    },
    recentActivity: [],
    notifications: {
      unreadCount: 0,
      urgent: 0,
      recent: []
    },
    systemStatus: {
      apiResponseTime: 0,
      databaseConnections: 0,
      uptime: 0,
      errorRate: 0
    }
  }

  const dashboardTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Main dashboard with key metrics'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Detailed charts and reports'
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      description: 'Recent sessions and reports'
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Zap,
      description: 'Smart recommendations'
    }
  ]

  const quickActionCards = [
    {
      title: 'Book Consultation',
      description: 'Schedule your next blockchain consultation',
      icon: Calendar,
      action: '/dashboard/book-consultation',
      color: 'from-blue-500 to-blue-600',
      stats: dashboardMetrics.quickStats.sessionsToday
    },
    {
      title: 'View Reports',
      description: 'Access your generated reports',
      icon: FileText,
      action: '/dashboard/reports',
      color: 'from-purple-500 to-purple-600',
      stats: dashboardMetrics.quickStats.reportsGenerated
    },
    {
      title: 'Upcoming Sessions',
      description: 'Manage scheduled consultations',
      icon: Clock,
      action: '/dashboard/sessions',
      color: 'from-green-500 to-green-600',
      stats: dashboardMetrics.quickStats.upcomingMeetings
    },
    {
      title: 'Performance',
      description: 'Track your progress',
      icon: Target,
      action: '/dashboard/analytics',
      color: 'from-orange-500 to-orange-600',
      stats: `${dashboardMetrics.quickStats.systemHealth}%`
    }
  ]

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div 
          {...animations.slideDown}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-light text-white">
                    Welcome back, <span className="font-normal bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </h1>
                  <p className="text-gray-400 text-lg">
                    {isAdmin ? 'Administrative Dashboard' : 'Blockchain Consulting Dashboard'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <RealtimeStatusIndicator
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                loading={metricsLoading}
                error={metricsError}
                onRefresh={refresh}
                systemHealth={metrics?.quickStats.systemHealth || 100}
              />
              <RealtimeNotifications userId={user.id} />
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {quickActionCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <GlassMorphismCard variant="neutral" hover={true}>
                  <Card className="bg-transparent border-0 cursor-pointer" onClick={() => window.location.href = card.action}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {card.stats}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm mb-1">{card.title}</div>
                        <div className="text-xs text-gray-400">{card.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                </GlassMorphismCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <EnhancedDashboardStats userId={user.id} />
            
            <HorizontalDivider style="subtle" />
            
            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <GlassMorphismCard variant="primary" hover={false}>
                  <Card className="bg-transparent border-0">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Latest updates and events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardMetrics.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm text-white">{activity.message}</div>
                            <div className="text-xs text-gray-400">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </GlassMorphismCard>
              </div>

              <div>
                <GlassMorphismCard variant="secondary" hover={false}>
                  <Card className="bg-transparent border-0">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Quick Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {dashboardMetrics.quickStats.systemHealth}%
                        </div>
                        <div className="text-sm text-gray-300">System Health</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Active Sessions</span>
                          <span className="text-sm text-blue-400">{dashboardMetrics.quickStats.sessionsToday}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Reports Ready</span>
                          <span className="text-sm text-purple-400">{dashboardMetrics.quickStats.reportsGenerated}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Upcoming</span>
                          <span className="text-sm text-orange-400">{dashboardMetrics.quickStats.upcomingMeetings}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </GlassMorphismCard>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <InteractiveCharts userId={user.id} timeRange="30d" />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassMorphismCard variant="primary" hover={false}>
                <Card className="bg-transparent border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Recent Sessions</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your latest consultation activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent sessions</p>
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                          Book Consultation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlassMorphismCard>

              <GlassMorphismCard variant="secondary" hover={false}>
                <Card className="bg-transparent border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Recent Reports</CardTitle>
                    <CardDescription className="text-gray-400">
                      Generated analysis and documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No reports generated yet</p>
                        <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                          Request Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlassMorphismCard>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-8">
            <AIRecommendations
              userProfile={{
                id: user.id,
                role: user.role || 'USER',
                industry: user.industry,
                experience: user.experience,
                consultationHistory: [],
                interests: [],
                companySize: user.companySize,
                budget: user.budget
              }}
              maxRecommendations={8}
              showHeader={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}