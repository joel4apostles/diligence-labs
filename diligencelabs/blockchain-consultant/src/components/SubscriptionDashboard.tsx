'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown,
  Star,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Coins,
  Award,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Gift,
  Percent,
  DollarSign,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react'

interface SubscriptionPlan {
  planType: string
  name: string
  price: number
  currency: string
  description: string
  features: {
    monthlyProjects: number | string
    expertReviews: number
    priorityLevel: string
    reputationBonus: number
    feeSharing?: boolean
    [key: string]: any
  }
  limits: {
    projectsPerMonth: number | string
    expertsPerProject: number
    [key: string]: any
  }
  popular?: boolean
  enterprise?: boolean
}

interface UserReputation {
  id: string
  totalPoints: number
  level: number
  projectsSubmitted: number
  averageRating: number
  completionRate: number
  user: {
    submitterTier: string
    monthlyProjectLimit: number
    monthlyProjectsUsed: number
    totalProjectsSubmitted: number
    successfulProjects: number
    averageProjectScore: number
  }
  achievements: Array<{
    title: string
    description: string
    pointsAwarded: number
    awardedAt: string
  }>
  tierProgression: {
    currentTier: string
    nextTier: string
    currentPoints: number
    nextTierPoints: number
    progress: number
    thresholds: Record<string, number>
  }
  monthlyLimits: {
    used: number
    limit: number
    resetDate: string
  }
}

export default function SubscriptionDashboard() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userReputation, setUserReputation] = useState<UserReputation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [plansResponse, reputationResponse] = await Promise.all([
        fetch('/api/subscription-plans'),
        fetch('/api/user-reputation')
      ])

      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlans(plansData.plans)
      }

      if (reputationResponse.ok) {
        const reputationData = await reputationResponse.json()
        setUserReputation(reputationData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ECOSYSTEM_PARTNER': return 'from-cyan-400 to-blue-600'
      case 'VC': return 'from-purple-400 to-purple-600'
      case 'PREMIUM': return 'from-yellow-400 to-yellow-600'
      case 'VERIFIED': return 'from-green-400 to-green-600'
      case 'BASIC': return 'from-gray-400 to-gray-600'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ECOSYSTEM_PARTNER': return Crown
      case 'VC': return Trophy
      case 'PREMIUM': return Star
      case 'VERIFIED': return Shield
      case 'BASIC': return Award
      default: return Award
    }
  }

  const formatPlanFeatures = (plan: SubscriptionPlan) => {
    const features = []
    
    if (plan.features.monthlyProjects) {
      features.push(`${plan.features.monthlyProjects} projects/month`)
    }
    if (plan.features.expertReviews) {
      features.push(`${plan.features.expertReviews} expert reviewers`)
    }
    if (plan.features.priorityLevel) {
      features.push(`${plan.features.priorityLevel.toLowerCase()} priority`)
    }
    if (plan.features.reputationBonus > 1) {
      features.push(`${plan.features.reputationBonus}x reputation bonus`)
    }
    if (plan.features.feeSharing) {
      features.push('Revenue sharing program')
    }
    
    return features
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading subscription dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Subscription & Reputation Dashboard</h2>
        <p className="text-gray-400">
          Manage your subscription and track your reputation progress
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'bg-blue-500' : 'border-gray-600 text-gray-400'}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'reputation' ? 'default' : 'outline'}
          onClick={() => setActiveTab('reputation')}
          className={activeTab === 'reputation' ? 'bg-blue-500' : 'border-gray-600 text-gray-400'}
        >
          Reputation
        </Button>
        <Button
          variant={activeTab === 'plans' ? 'default' : 'outline'}
          onClick={() => setActiveTab('plans')}
          className={activeTab === 'plans' ? 'bg-blue-500' : 'border-gray-600 text-gray-400'}
        >
          Subscription Plans
        </Button>
        <Button
          variant={activeTab === 'rewards' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rewards')}
          className={activeTab === 'rewards' ? 'bg-blue-500' : 'border-gray-600 text-gray-400'}
        >
          Rewards & Sharing
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && userReputation && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Status */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <BarChart3 className="w-5 h-5 mr-2" />
                Your Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tier Badge */}
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-r ${getTierColor(userReputation.user.submitterTier)} rounded-full flex items-center justify-center mb-4`}>
                    {(() => {
                      const TierIcon = getTierIcon(userReputation.user.submitterTier)
                      return <TierIcon className="w-10 h-10 text-white" />
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {userReputation.user.submitterTier.replace('_', ' ')} Tier
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Level {userReputation.level}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">{userReputation.totalPoints.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Reputation Points</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">{userReputation.user.totalProjectsSubmitted}</p>
                    <p className="text-sm text-gray-400">Projects Submitted</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{userReputation.user.averageProjectScore.toFixed(1)}</p>
                    <p className="text-sm text-gray-400">Avg Project Score</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-400">{userReputation.completionRate.toFixed(0)}%</p>
                    <p className="text-sm text-gray-400">Completion Rate</p>
                  </div>
                </div>

                {/* Monthly Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Monthly Projects Used</span>
                    <span className="text-white">{userReputation.monthlyLimits.used} / {userReputation.monthlyLimits.limit}</span>
                  </div>
                  <Progress 
                    value={(userReputation.monthlyLimits.used / userReputation.monthlyLimits.limit) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier Progression */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="w-5 h-5 mr-2" />
                Tier Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                {userReputation.tierProgression.nextTier !== 'MAX' ? (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress to {userReputation.tierProgression.nextTier}</span>
                      <span className="text-white">
                        {userReputation.tierProgression.currentPoints} / {userReputation.tierProgression.nextTierPoints}
                      </span>
                    </div>
                    <Progress value={userReputation.tierProgression.progress} className="h-3" />
                    <p className="text-xs text-gray-400 mt-2">
                      {userReputation.tierProgression.nextTierPoints - userReputation.tierProgression.currentPoints} points needed
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">Maximum Tier Achieved!</p>
                    <p className="text-gray-400 text-sm">You've reached the highest tier available</p>
                  </div>
                )}

                {/* Recent Achievements */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {userReputation.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800/30 rounded-lg">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{achievement.title}</p>
                          <p className="text-gray-400 text-xs">+{achievement.pointsAwarded} points</p>
                        </div>
                      </div>
                    ))}
                    {userReputation.achievements.length === 0 && (
                      <p className="text-gray-400 text-sm">No achievements yet. Submit your first project to start earning!</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reputation Tab */}
      {activeTab === 'reputation' && (
        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Reputation System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Tier Benefits */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Tier Benefits</h4>
                  <div className="space-y-3">
                    {['BASIC', 'VERIFIED', 'PREMIUM', 'VC', 'ECOSYSTEM_PARTNER'].map(tier => {
                      const TierIcon = getTierIcon(tier)
                      const isCurrentTier = userReputation?.user.submitterTier === tier
                      const isUnlocked = userReputation && userReputation.tierProgression.thresholds[tier] <= userReputation.totalPoints
                      
                      return (
                        <div 
                          key={tier}
                          className={`p-3 rounded-lg border ${
                            isCurrentTier 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : isUnlocked 
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-gray-700 bg-gray-800/30'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTierColor(tier)} flex items-center justify-center`}>
                              <TierIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className={`font-medium ${isCurrentTier ? 'text-blue-400' : isUnlocked ? 'text-green-400' : 'text-gray-400'}`}>
                                {tier.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {userReputation?.tierProgression.thresholds[tier]} points
                              </p>
                            </div>
                            {isCurrentTier && <Badge className="ml-auto bg-blue-500/20 text-blue-400">Current</Badge>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* How to Earn Points */}
                <div>
                  <h4 className="text-white font-semibold mb-3">How to Earn Points</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">Submit Quality Project</p>
                        <p className="text-gray-400 text-xs">+50-200 points</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">High Expert Ratings</p>
                        <p className="text-gray-400 text-xs">+10-50 points</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">Complete Evaluations</p>
                        <p className="text-gray-400 text-xs">+25 points</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">Milestone Achievements</p>
                        <p className="text-gray-400 text-xs">+100-500 points</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Limits */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Tier Limits</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-white text-sm">BASIC</p>
                      <p className="text-gray-400 text-xs">1 project/month</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-white text-sm">VERIFIED</p>
                      <p className="text-gray-400 text-xs">3 projects/month</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-white text-sm">PREMIUM</p>
                      <p className="text-gray-400 text-xs">10 projects/month</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-white text-sm">VC</p>
                      <p className="text-gray-400 text-xs">50 projects/month</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-white text-sm">ECOSYSTEM PARTNER</p>
                      <p className="text-gray-400 text-xs">Unlimited projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`bg-gray-900/50 border-gray-800 relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              } ${plan.enterprise ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              {plan.enterprise && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Enterprise</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">
                  ${plan.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  {formatPlanFeatures(plan).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.features.feeSharing && (
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 text-sm">Fee sharing rewards</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full ${
                    plan.popular || plan.enterprise
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rewards & Fee Sharing Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Coins className="w-5 h-5 mr-2" />
                Fee Sharing Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* How it Works */}
                <div>
                  <h4 className="text-white font-semibold mb-4">How Fee Sharing Works</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Premium Subscribers Pay Fees</p>
                        <p className="text-gray-400 text-xs">VC and Ecosystem Partner subscribers pay evaluation fees</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Percent className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">65% Goes to Expert Pool</p>
                        <p className="text-gray-400 text-xs">Experts receive rewards based on evaluation quality</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Gift className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">5% Back to Quality Submitters</p>
                        <p className="text-gray-400 text-xs">High-rated projects earn submitter bonuses</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">30% Platform Operations</p>
                        <p className="text-gray-400 text-xs">Platform maintenance and development</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Potential */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Earnings Potential</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-400 font-semibold">Expert Rewards</p>
                      <p className="text-white text-sm">$50-500 per evaluation</p>
                      <p className="text-gray-400 text-xs">Based on project complexity and quality</p>
                    </div>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 font-semibold">Quality Bonuses</p>
                      <p className="text-white text-sm">20-50% bonus</p>
                      <p className="text-gray-400 text-xs">For highly rated evaluations</p>
                    </div>
                    
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-400 font-semibold">Submitter Rewards</p>
                      <p className="text-white text-sm">5-15% cashback</p>
                      <p className="text-gray-400 text-xs">For projects scoring 8.0+ average</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 font-semibold">Tier Bonuses</p>
                      <p className="text-white text-sm">Up to 3x multiplier</p>
                      <p className="text-gray-400 text-xs">Higher tiers earn more rewards</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Requirements */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Eligibility Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">For Experts</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Verified expert status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Minimum 10 completed evaluations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">85%+ accuracy rating</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Active in last 30 days</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-3">For Project Submitters</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Verified or higher tier</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Minimum 3 completed projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Average project score 7.0+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Good standing account</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}