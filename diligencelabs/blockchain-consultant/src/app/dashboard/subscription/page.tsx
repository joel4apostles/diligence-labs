"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar,
  TrendingUp,
  Download,
  Settings,
  Crown,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  FileText,
  DollarSign
} from "lucide-react"

interface SubscriptionData {
  id: string
  planType: string
  status: string
  amount: number
  billingCycle: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
}

interface UsageData {
  creditBalance: {
    isUnlimited: boolean
    remainingCredits: number
    usedCredits: number
    totalCredits: number
  }
  currentUsage: {
    consultations: number
    reports: number
    sessions: number
  }
}

export default function SubscriptionManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/unified-signin')
      return
    }

    setIsPageLoaded(true)
    fetchSubscriptionData()
  }, [session, status, router])

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true)
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscriptions/manage'),
        fetch('/api/subscriptions/usage')
      ])

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setSubscription(subscriptionData.subscription)
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsage(usageData)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    try {
      setIsUpdating(true)
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id })
      })

      if (response.ok) {
        await fetchSubscriptionData()
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanDisplayName = (planType: string) => {
    return planType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8 animate-pulse">
            <div className="h-12 bg-gray-800/50 rounded-lg w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light mb-3">
                Subscription <span className="font-normal bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Manage your subscription plan, billing details, and view your usage statistics.
              </p>
            </div>
            
            {!subscription && (
              <div className="flex items-center gap-4">
                <Link href="/dashboard/upgrade">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Current Plan</p>
                  <p className="text-2xl font-bold text-white">
                    {subscription ? getPlanDisplayName(subscription.planType) : 'Free'}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Monthly Spend</p>
                  <p className="text-2xl font-bold text-white">
                    ${subscription?.amount || 0}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Status</p>
                  <p className={`text-2xl font-bold ${subscription?.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'}`}>
                    {subscription?.status || 'Inactive'}
                  </p>
                </div>
                {subscription?.status === 'ACTIVE' ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Subscription */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Current Subscription</h2>
            
            {subscription ? (
              <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white flex items-center">
                        <Crown className="w-6 h-6 mr-2 text-yellow-400" />
                        {getPlanDisplayName(subscription.planType)}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-2">
                        ${subscription.amount} per {subscription.billingCycle?.toLowerCase() || 'month'}
                      </CardDescription>
                    </div>
                    <Badge className={`${
                      subscription.status === 'ACTIVE' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">Current Period</div>
                      <div className="text-sm text-gray-400">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">Next Billing</div>
                      <div className="text-sm text-gray-400">
                        {formatDate(subscription.currentPeriodEnd)}
                      </div>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center text-yellow-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <Link href="/dashboard/upgrade">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Change Plan
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        onClick={() => window.open('https://billing.stripe.com', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Billing
                      </Button>
                    </div>
                    {!subscription.cancelAtPeriodEnd && (
                      <Button 
                        onClick={handleCancelSubscription}
                        disabled={isUpdating}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        {isUpdating ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    You're currently on the free plan. Upgrade to unlock premium features and unlimited consultations.
                  </p>
                  <Link href="/dashboard/upgrade">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Usage Statistics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Usage Statistics</h2>
            
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Current Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usage ? (
                  <>
                    {/* Credit Balance */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-300">Available Credits</span>
                        <span className="text-2xl font-bold text-blue-400">
                          {usage.creditBalance.isUnlimited ? '∞' : usage.creditBalance.remainingCredits}
                        </span>
                      </div>
                      {!usage.creditBalance.isUnlimited && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max(10, (usage.creditBalance.remainingCredits / usage.creditBalance.totalCredits) * 100)}%` 
                            }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-blue-300 mt-2">
                        {usage.creditBalance.isUnlimited 
                          ? 'Unlimited consultations available' 
                          : `${usage.creditBalance.usedCredits} of ${usage.creditBalance.totalCredits} credits used`
                        }
                      </p>
                    </div>

                    {/* Usage Breakdown */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-gray-300">Consultations</span>
                        <span className="text-white font-medium">{usage.currentUsage.consultations}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-gray-300">Reports</span>
                        <span className="text-white font-medium">{usage.currentUsage.reports}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-gray-300">Sessions</span>
                        <span className="text-white font-medium">{usage.currentUsage.sessions}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-400">No usage data available</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700/50">
                  <Button 
                    onClick={fetchSubscriptionData}
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Usage Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-400" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🧾</div>
                  <p className="text-gray-400 mb-4">Your billing history will appear here</p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                    onClick={() => window.open('https://billing.stripe.com', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}