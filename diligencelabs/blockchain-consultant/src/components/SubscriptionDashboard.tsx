'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown,
  Star,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Settings
} from 'lucide-react'

interface SubscriptionPlan {
  planType: string
  name: string
  price: number
  currency: string
  description: string
  features: {
    monthlyConsultations: number | string
    priorityLevel: string
    supportLevel: string
    [key: string]: any
  }
  limits: {
    consultationsPerMonth: number | string
    [key: string]: any
  }
  popular?: boolean
  enterprise?: boolean
}

export default function SubscriptionDashboard() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription-plans')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans')
      }

      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load subscription information')
    } finally {
      setLoading(false)
    }
  }

  const getFeatureList = (plan: SubscriptionPlan): string[] => {
    const features: string[] = []
    
    if (plan.features.monthlyConsultations) {
      const consultations = typeof plan.features.monthlyConsultations === 'string' 
        ? plan.features.monthlyConsultations 
        : `${plan.features.monthlyConsultations}`
      features.push(`${consultations} monthly consultations`)
    }
    
    if (plan.features.priorityLevel) {
      features.push(`${plan.features.priorityLevel} priority`)
    }
    
    if (plan.features.supportLevel) {
      features.push(`${plan.features.supportLevel} support`)
    }

    return features
  }

  const getPlanIcon = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'basic': return Star
      case 'professional': return Crown
      case 'enterprise': return Settings
      default: return CheckCircle
    }
  }

  const getPlanColor = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'basic': return 'from-blue-400 to-blue-600'
      case 'professional': return 'from-purple-400 to-purple-600'
      case 'enterprise': return 'from-orange-400 to-orange-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-700/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchPlans} variant="outline" className="border-red-600 text-red-400">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Subscription Plans</h2>
        <p className="text-gray-400 text-lg">
          Choose the consulting plan that fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const IconComponent = getPlanIcon(plan.planType)
          const features = getFeatureList(plan)
          
          return (
            <Card 
              key={plan.planType} 
              className={`relative bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${getPlanColor(plan.planType)} rounded-full flex items-center justify-center mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <CardTitle className="text-white text-xl mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-400 text-lg ml-1">
                    /{plan.currency === 'USD' ? 'month' : plan.currency}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full bg-gradient-to-r ${getPlanColor(plan.planType)} hover:opacity-90 transition-opacity`}
                >
                  Choose {plan.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {plans.length === 0 && !loading && !error && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Subscription Plans Available
            </h3>
            <p className="text-gray-400">
              Subscription plans are being configured. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}