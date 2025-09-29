"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubscriptionForm } from "@/components/subscription-form"
import { PAID_SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Users,
  TrendingUp,
  Clock,
  HeadphonesIcon,
  FileText,
  Wallet
} from "lucide-react"

const SUBSCRIPTION_PLANS = [
  {
    id: "PROFESSIONAL_MONTHLY",
    name: "Professional",
    description: "Perfect for growing blockchain projects",
    icon: Crown,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    popular: true,
    features: [
      "5 consultation sessions per month",
      "Priority scheduling",
      "Detailed project reports",
      "Email support within 24 hours",
      "Due diligence documentation",
      "Token launch guidance"
    ],
    savings: "Save $590/year"
  },
  {
    id: "ENTERPRISE_MONTHLY",
    name: "Enterprise",
    description: "Comprehensive support for large organizations",
    icon: Shield,
    monthlyPrice: 599,
    yearlyPrice: 5990,
    popular: false,
    features: [
      "Unlimited consultation sessions",
      "Dedicated account manager",
      "Custom integration planning",
      "24/7 priority support",
      "On-site workshop sessions",
      "Multi-project coordination",
      "Regulatory compliance review",
      "Executive briefings"
    ],
    savings: "Save $1,198/year"
  }
]

export default function UpgradePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('YEARLY')
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/unified-signin')
      return
    }

    // Check current subscription status
    fetchSubscriptionData()
  }, [session, status, router])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions/manage')
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/auth/unified-signin')
      return
    }

    // Find the plan from the imported PAID_SUBSCRIPTION_PLANS
    const planConfig = PAID_SUBSCRIPTION_PLANS.find(p => p.id === planId)
    
    if (!planConfig) {
      alert('Invalid plan selected')
      return
    }

    // Show subscription form for users to fill in project details
    setSelectedPlan(planConfig)
    setShowSubscriptionForm(true)
  }

  const handleFormSuccess = () => {
    setShowSubscriptionForm(false)
    // Redirect to dashboard or show success message
    router.push('/dashboard')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8 animate-pulse">
            <div className="h-12 bg-gray-800/50 rounded-lg w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-800/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-purple-400 text-sm mb-4">
              <Zap className="h-4 w-4" />
              <span>Unlock Premium Features</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-light mb-4">
              Choose Your <span className="font-normal bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Plan</span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upgrade to access unlimited consultations, priority support, and advanced blockchain advisory services.
            </p>
          </div>

          {/* Current Plan Status */}
          {currentSubscription && (
            <div className="mb-8">
              <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Current Plan: {currentSubscription.planType?.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </h3>
                        <p className="text-sm text-blue-300">
                          Status: {currentSubscription.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  billingCycle === 'MONTHLY' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === 'YEARLY' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">Save 20%</Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const IconComponent = plan.icon
            const isYearly = billingCycle === 'YEARLY'
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const monthlyPrice = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-gray-900/50 backdrop-blur-sm border-gray-800 transition-all duration-300 hover:shadow-xl h-full flex flex-col ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-105 bg-gray-900/80' 
                    : 'hover:border-gray-700 hover:bg-gray-900/70'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 shadow-lg shadow-purple-500/30 font-medium text-xs">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  {/* Icon */}
                  <div className={`mx-auto mb-4 p-3 rounded-xl w-fit transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
                      : 'bg-gray-800/50 border border-gray-700/50'
                  }`}>
                    <IconComponent className={`h-8 w-8 ${
                      plan.popular ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                  </div>

                  {/* Title & Description */}
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className={`text-4xl font-bold mb-1 ${
                      plan.popular ? 'text-white' : 'text-gray-100'
                    }`}>
                      ${monthlyPrice}
                      <span className="text-lg font-normal text-gray-400">/month</span>
                    </div>
                    {isYearly && (
                      <div className={`text-sm ${
                        plan.popular ? 'text-purple-300' : 'text-green-400'
                      }`}>
                        {plan.savings} • Billed ${isYearly ? 'annually' : 'monthly'}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id || currentSubscription?.planType === plan.id}
                      size="lg"
                      className={`w-full h-12 font-medium transition-all duration-300 ${
                        currentSubscription?.planType === plan.id
                          ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                          : plan.popular
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                            : 'bg-transparent border-2 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50 hover:text-white hover:scale-[1.02]'
                      }`}
                    >
                      {subscribing === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : currentSubscription?.planType === plan.id ? (
                        'Current Plan'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-white">
            Why Upgrade to Premium?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Expert Access</h4>
              <p className="text-gray-400 text-sm">
                Direct access to blockchain experts with years of industry experience and proven track records.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Priority Support</h4>
              <p className="text-gray-400 text-sm">
                Get faster response times and priority scheduling for your most critical blockchain decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Detailed Reports</h4>
              <p className="text-gray-400 text-sm">
                Comprehensive analysis and documentation to support your blockchain project development.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Ready to accelerate your blockchain project?
          </h3>
          <p className="text-gray-400 mb-6">
            Join hundreds of successful projects that chose our premium advisory services.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <Check className="h-4 w-4" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <HeadphonesIcon className="h-4 w-4" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Form Modal */}
      {selectedPlan && (
        <SubscriptionForm 
          plan={selectedPlan}
          isOpen={showSubscriptionForm}
          onClose={() => setShowSubscriptionForm(false)}
          onSuccess={handleFormSuccess}
          context="dashboard"
        />
      )}
    </div>
  )
}