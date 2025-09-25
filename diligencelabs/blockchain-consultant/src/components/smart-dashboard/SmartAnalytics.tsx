'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Brain,
  Zap,
  Users,
  Clock,
  Star,
  Award,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { 
  GlassMorphismCard,
  theme,
  animations
} from '@/components/ui/consistent-theme'

interface SmartAnalyticsProps {
  userId: string
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

interface AnalyticsData {
  consultationEngagement: {
    totalConsultations: number
    averageRating: number
    completionRate: number
    trend: 'up' | 'down' | 'stable'
    trendPercentage: number
  }
  learningProgress: {
    topicsExplored: number
    knowledgeScore: number
    progressThisMonth: number
    nextMilestone: string
  }
  platformUsage: {
    sessionDuration: number
    featuresUsed: string[]
    lastActive: Date
    streakDays: number
  }
  aiInsights: {
    recommendationsFollowed: number
    successRate: number
    timeToAction: number
    personalizedScore: number
  }
}

export default function SmartAnalytics({ userId, timeRange = '30d' }: SmartAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [userId, timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      // Simulate analytics data - in production, this would come from API
      const mockAnalytics: AnalyticsData = {
        consultationEngagement: {
          totalConsultations: Math.floor(Math.random() * 20) + 5,
          averageRating: 4.2 + Math.random() * 0.7,
          completionRate: 85 + Math.random() * 10,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          trendPercentage: Math.floor(Math.random() * 20) + 5
        },
        learningProgress: {
          topicsExplored: Math.floor(Math.random() * 15) + 8,
          knowledgeScore: Math.floor(Math.random() * 40) + 60,
          progressThisMonth: Math.floor(Math.random() * 30) + 15,
          nextMilestone: 'Advanced DeFi Strategies'
        },
        platformUsage: {
          sessionDuration: Math.floor(Math.random() * 60) + 20, // minutes
          featuresUsed: ['Consultations', 'AI Recommendations', 'Reports', 'Resources'],
          lastActive: new Date(),
          streakDays: Math.floor(Math.random() * 30) + 5
        },
        aiInsights: {
          recommendationsFollowed: Math.floor(Math.random() * 10) + 3,
          successRate: 70 + Math.random() * 25,
          timeToAction: Math.floor(Math.random() * 48) + 2, // hours
          personalizedScore: 75 + Math.random() * 20
        }
      }

      setTimeout(() => {
        setAnalytics(mockAnalytics)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
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

  if (!analytics) {
    return (
      <GlassMorphismCard variant="neutral">
        <Card className="bg-transparent border-0">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Analytics Unavailable
            </h3>
            <p className="text-gray-400">
              Complete more activities to see your smart analytics
            </p>
          </CardContent>
        </Card>
      </GlassMorphismCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-light text-white">
            Smart Analytics
          </h2>
        </div>
        <p className="text-gray-400 text-lg">
          AI-powered insights into your blockchain learning journey
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Consultation Engagement */}
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
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(analytics.consultationEngagement.trend)}
                    <span className={`text-xs ${analytics.consultationEngagement.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {analytics.consultationEngagement.trendPercentage}%
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg text-white">
                  Consultation Engagement
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your consultation activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Total Sessions</span>
                    <span className="text-xl font-bold text-white">
                      {analytics.consultationEngagement.totalConsultations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Avg Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">
                        {analytics.consultationEngagement.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Completion Rate</span>
                      <span className="text-sm text-white">
                        {Math.round(analytics.consultationEngagement.completionRate)}%
                      </span>
                    </div>
                    <Progress 
                      value={analytics.consultationEngagement.completionRate} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>

        {/* Learning Progress */}
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
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(analytics.learningProgress.knowledgeScore)}`}>
                    {analytics.learningProgress.knowledgeScore}
                  </div>
                </div>
                <CardTitle className="text-lg text-white">
                  Learning Progress
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Knowledge advancement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Topics Explored</span>
                    <span className="text-lg font-bold text-white">
                      {analytics.learningProgress.topicsExplored}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">This Month</span>
                      <span className="text-sm text-white">
                        +{analytics.learningProgress.progressThisMonth}%
                      </span>
                    </div>
                    <Progress 
                      value={analytics.learningProgress.progressThisMonth} 
                      className="h-2" 
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    <strong>Next:</strong> {analytics.learningProgress.nextMilestone}
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>

        {/* Platform Usage */}
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
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">{analytics.platformUsage.streakDays}d</span>
                  </div>
                </div>
                <CardTitle className="text-lg text-white">
                  Platform Usage
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Activity and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Session Time</span>
                    <span className="text-lg font-bold text-white">
                      {formatDuration(analytics.platformUsage.sessionDuration)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Features Used</span>
                    <span className="text-sm font-medium text-white">
                      {analytics.platformUsage.featuresUsed.length}/6
                    </span>
                  </div>
                  <div>
                    <Progress 
                      value={(analytics.platformUsage.featuresUsed.length / 6) * 100} 
                      className="h-2 mb-2" 
                    />
                    <div className="flex flex-wrap gap-1">
                      {analytics.platformUsage.featuresUsed.slice(0, 2).map((feature, i) => (
                        <span key={i} className="text-xs bg-green-500/20 text-green-300 px-1 py-0.5 rounded">
                          {feature}
                        </span>
                      ))}
                      {analytics.platformUsage.featuresUsed.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{analytics.platformUsage.featuresUsed.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <GlassMorphismCard variant="primary" hover={true}>
            <Card className="bg-transparent border-0 h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(analytics.aiInsights.personalizedScore)}`}>
                    {Math.round(analytics.aiInsights.personalizedScore)}
                  </div>
                </div>
                <CardTitle className="text-lg text-white">
                  AI Insights
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personalization effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Followed</span>
                    <span className="text-lg font-bold text-white">
                      {analytics.aiInsights.recommendationsFollowed}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Success Rate</span>
                      <span className="text-sm text-white">
                        {Math.round(analytics.aiInsights.successRate)}%
                      </span>
                    </div>
                    <Progress 
                      value={analytics.aiInsights.successRate} 
                      className="h-2" 
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    Avg response: {analytics.aiInsights.timeToAction}h
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassMorphismCard>
        </motion.div>
      </div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <GlassMorphismCard variant="neutral">
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Key Insights
              </CardTitle>
              <CardDescription className="text-gray-400">
                AI-generated insights based on your activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {analytics.consultationEngagement.trend === 'up' ? '📈' : '📊'}
                  </div>
                  <div className="text-sm font-medium text-white mb-1">
                    Engagement {analytics.consultationEngagement.trend === 'up' ? 'Rising' : 'Stable'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {analytics.consultationEngagement.trend === 'up' ? 'Great momentum!' : 'Consistent activity'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-1">🎯</div>
                  <div className="text-sm font-medium text-white mb-1">
                    {analytics.learningProgress.knowledgeScore >= 80 ? 'Expert Level' : 'Growing Fast'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Knowledge score: {analytics.learningProgress.knowledgeScore}/100
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">🚀</div>
                  <div className="text-sm font-medium text-white mb-1">
                    AI Optimized
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.round(analytics.aiInsights.personalizedScore)}% personalization match
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