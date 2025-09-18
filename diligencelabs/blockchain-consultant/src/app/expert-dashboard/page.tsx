'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Coins, 
  Award,
  Medal,
  Target,
  Activity,
  Calendar,
  ArrowRight,
  Crown
} from 'lucide-react'
import ExpertLeaderboard from '@/components/ExpertLeaderboard'
import SubscriptionDashboard from '@/components/SubscriptionDashboard'

// Dynamic imports for background components
const FloatingElements = dynamic(() => import("@/components/ui/animated-background").then(mod => ({ default: mod.FloatingElements })), {
  ssr: false,
  loading: () => null
})

const ParallaxBackground = dynamic(() => import("@/components/ui/parallax-background").then(mod => ({ default: mod.ParallaxBackground })), {
  ssr: false,
  loading: () => null
})

const HeroGridLines = dynamic(() => import("@/components/ui/grid-lines").then(mod => ({ default: mod.HeroGridLines })), {
  ssr: false,
  loading: () => null
})

const DynamicPageBackground = dynamic(() => import("@/components/ui/dynamic-page-background").then(mod => ({ default: mod.DynamicPageBackground })), {
  ssr: false,
  loading: () => null
})

export default function ExpertDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardTab, setDashboardTab] = useState('performance')

  // Mock data for demonstration
  const expertStats = {
    reputationPoints: 2847,
    totalEvaluations: 43,
    accuracy: 94.2,
    currentTier: 'Gold',
    rank: 7,
    totalRewards: 15.8,
    monthlyEvaluations: 12,
    averageRating: 4.8
  }

  const leaderboard = [
    { rank: 1, name: 'Alex Chen', points: 3521, tier: 'Platinum', evaluations: 67, accuracy: 96.8, rewards: 24.3 },
    { rank: 2, name: 'Sarah Kim', points: 3245, tier: 'Platinum', evaluations: 58, accuracy: 95.1, rewards: 21.7 },
    { rank: 3, name: 'Marcus Johnson', points: 3102, tier: 'Gold', evaluations: 52, accuracy: 94.9, rewards: 19.4 },
    { rank: 4, name: 'Elena Rodriguez', points: 2943, tier: 'Gold', evaluations: 48, accuracy: 93.7, rewards: 18.2 },
    { rank: 5, name: 'David Park', points: 2891, tier: 'Gold', evaluations: 45, accuracy: 95.2, rewards: 17.8 },
    { rank: 6, name: 'Lisa Wang', points: 2856, tier: 'Gold', evaluations: 44, accuracy: 92.8, rewards: 16.9 },
    { rank: 7, name: 'You', points: 2847, tier: 'Gold', evaluations: 43, accuracy: 94.2, rewards: 15.8, current: true },
    { rank: 8, name: 'James Liu', points: 2734, tier: 'Silver', evaluations: 41, accuracy: 91.5, rewards: 14.6 },
    { rank: 9, name: 'Anna Petrov', points: 2689, tier: 'Silver', evaluations: 39, accuracy: 93.1, rewards: 13.8 },
    { rank: 10, name: 'Tom Wilson', points: 2645, tier: 'Silver', evaluations: 37, accuracy: 90.2, rewards: 12.9 }
  ]

  const recentEvaluations = [
    { id: 1, project: 'DeFiSwap Protocol', status: 'Completed', score: 8.7, date: '2025-09-15', reward: 0.8, category: 'DeFi' },
    { id: 2, project: 'NFT Marketplace Plus', status: 'In Progress', score: null, date: '2025-09-14', reward: 0.6, category: 'NFT' },
    { id: 3, project: 'Layer2 Bridge', status: 'Completed', score: 9.2, date: '2025-09-13', reward: 1.2, category: 'Infrastructure' },
    { id: 4, project: 'GameFi Universe', status: 'Completed', score: 7.8, date: '2025-09-12', reward: 0.7, category: 'Gaming' }
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-purple-400 to-purple-600'
      case 'Gold': return 'from-yellow-400 to-yellow-600'
      case 'Silver': return 'from-gray-400 to-gray-600'
      case 'Bronze': return 'from-amber-600 to-amber-800'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return Crown
      case 'Gold': return Trophy
      case 'Silver': return Medal
      case 'Bronze': return Award
      default: return Star
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Page Background */}
      <DynamicPageBackground variant="default" opacity={0.25} />
      <HeroGridLines />
      <ParallaxBackground />
      <FloatingElements />

      <div className="relative z-10">
        {/* Header */}
        <div className="py-8 border-b border-gray-800">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-4">
                  <Link 
                    href="/due-diligence"
                    className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Due Diligence
                  </Link>
                </div>
                <h1 className="text-4xl font-bold mb-2">Expert Dashboard</h1>
                <p className="text-gray-400">Track your performance, reputation, and rewards</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTierColor(expertStats.currentTier)} flex items-center justify-center`}>
                    {(() => {
                      const TierIcon = getTierIcon(expertStats.currentTier)
                      return <TierIcon className="w-4 h-4 text-white" />
                    })()}
                  </div>
                  <Badge variant="outline" className={`border-yellow-400/50 text-yellow-400`}>
                    {expertStats.currentTier} Expert
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{expertStats.reputationPoints.toLocaleString()} RP</p>
                <p className="text-sm text-gray-400">Rank #{expertStats.rank}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="py-8 border-b border-gray-800">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setDashboardTab('performance')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  dashboardTab === 'performance'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Performance Dashboard
              </button>
              <button
                onClick={() => setDashboardTab('leaderboard')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  dashboardTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Expert Rankings
              </button>
              <button
                onClick={() => setDashboardTab('subscription')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  dashboardTab === 'subscription'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Reputation & Rewards
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {dashboardTab === 'performance' && (
          <div className="py-12">
            <div className="container mx-auto px-6">
              {/* Stats Overview */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Evaluations</p>
                      <p className="text-2xl font-bold">{expertStats.totalEvaluations}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Accuracy Rate</p>
                      <p className="text-2xl font-bold">{expertStats.accuracy}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Rewards</p>
                      <p className="text-2xl font-bold">{expertStats.totalRewards} ETH</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Coins className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Average Rating</p>
                      <p className="text-2xl font-bold">{expertStats.averageRating}/5</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Leaderboard */}
              <div className="lg:col-span-1">
                <ExpertLeaderboard 
                  showFilters={false} 
                  maxEntries={10} 
                  showSearch={false} 
                />
              </div>

              {/* Right Column - Recent Activity & Performance */}
              <div className="lg:col-span-2 space-y-6">
                {/* Performance Chart */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        <span>Monthly Performance</span>
                      </div>
                      <Badge variant="outline" className="border-green-400/50 text-green-400">
                        +12 evaluations this month
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Reputation Progress to Platinum</span>
                          <span>2,847 / 3,500 RP</span>
                        </div>
                        <Progress value={(expertStats.reputationPoints / 3500) * 100} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{expertStats.monthlyEvaluations}</p>
                          <p className="text-xs text-gray-400">This Month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">{expertStats.accuracy}%</p>
                          <p className="text-xs text-gray-400">Accuracy</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">+653</p>
                          <p className="text-xs text-gray-400">RP Gained</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Evaluations */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span>Recent Evaluations</span>
                      </div>
                      <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        View All <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentEvaluations.map((evaluation) => (
                        <div key={evaluation.id} className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">{evaluation.project}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {evaluation.category}
                                </Badge>
                                <span className="text-xs text-gray-400">{evaluation.date}</span>
                                <Badge 
                                  className={`text-xs ${
                                    evaluation.status === 'Completed' 
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  }`}
                                >
                                  {evaluation.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              {evaluation.score && (
                                <p className="font-bold text-lg">{evaluation.score}/10</p>
                              )}
                              <p className="text-sm text-gray-400">+{evaluation.reward} ETH</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Expert Leaderboard Tab */}
        {dashboardTab === 'leaderboard' && (
          <div className="py-12">
            <div className="container mx-auto px-6">
              <ExpertLeaderboard />
            </div>
          </div>
        )}

        {/* Subscription & Reputation Tab */}
        {dashboardTab === 'subscription' && (
          <div className="py-12">
            <div className="container mx-auto px-6">
              <SubscriptionDashboard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}