'use client'

import { useState } from 'react'
import Link from 'next/link'
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

export default function ExpertDashboard() {
  const [dashboardTab, setDashboardTab] = useState('performance')

  // Mock data for demonstration
  const expertStats = {
    totalEvaluations: 127,
    accuracy: 94,
    totalRewards: 12.5,
    averageRating: 4.8,
    reputationPoints: 2847,
    rank: 15,
    monthlyEvaluations: 23,
    tier: 'Gold'
  }

  const recentEvaluations = [
    {
      id: 1,
      project: 'DeFi Protocol Audit',
      category: 'Security',
      status: 'Completed',
      date: '2 days ago',
      score: 9,
      reward: 0.8
    },
    {
      id: 2,
      project: 'NFT Marketplace Review',
      category: 'Technical',
      status: 'In Progress',
      date: '1 week ago',
      score: null,
      reward: 1.2
    }
  ]

  const TierIcon = ({ className }: { className: string }) => {
    switch (expertStats.tier) {
      case 'Gold':
        return <Medal className={className} />
      case 'Platinum':
        return <Crown className={className} />
      default:
        return <Trophy className={className} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div>
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Expert Dashboard</h1>
                <p className="text-gray-400">Track your performance, reputation, and rewards</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <TierIcon className="w-4 h-4 text-white" />
                </div>
                <Badge variant="outline" className="border-yellow-400/50 text-yellow-400">
                  {expertStats.tier} Expert
                </Badge>
              </div>
              <p className="text-2xl font-bold">{expertStats.reputationPoints.toLocaleString()} RP</p>
              <p className="text-sm text-gray-400">Rank #{expertStats.rank}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setDashboardTab('performance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dashboardTab === 'performance'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setDashboardTab('leaderboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dashboardTab === 'leaderboard'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setDashboardTab('subscription')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dashboardTab === 'subscription'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Subscription
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
                {/* Left Column - Performance Chart */}
                <div className="lg:col-span-2 space-y-8">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-green-400" />
                          <span>Monthly Performance</span>
                        </div>
                        <Badge variant="outline" className="border-green-400/50 text-green-400">
                          +15% this month
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
          </div>
        )}

        {/* Expert Leaderboard Tab */}
        {dashboardTab === 'leaderboard' && (
          <div className="py-12">
            <div className="container mx-auto px-6">
              <div className="text-white">Leaderboard coming soon...</div>
            </div>
          </div>
        )}

        {/* Subscription & Reputation Tab */}
        {dashboardTab === 'subscription' && (
          <div className="py-12">
            <div className="container mx-auto px-6">
              <div className="text-white">Subscription dashboard coming soon...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}