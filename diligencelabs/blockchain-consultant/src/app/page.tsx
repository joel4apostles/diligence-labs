"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useUnifiedAuth } from "@/components/providers/unified-auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"
import { Logo } from "@/components/ui/logo"

// Wingbits-inspired components
import { EnhancedLandingPage, EnhancedNavigation } from "@/components/ui/enhanced-landing-page"

// Dynamically import heavy components for better performance
const ContactForm = dynamic(() => import("@/components/contact-form").then(mod => ({ default: mod.ContactForm })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-800/50 rounded-xl" />,
  ssr: false
})

const SubscriptionForm = dynamic(() => import("@/components/subscription").then(mod => ({ default: mod.SubscriptionForm })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-800/50 rounded-xl" />,
  ssr: false
})

export default function Home() {
  const { data: session } = useSession()
  const { isAuthenticated } = useUnifiedAuth()
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentService, setCurrentService] = useState(0)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [expandedService, setExpandedService] = useState<number | null>(null)

  const services = [
    {
      title: "Strategic Advisory",
      description: "We'll help you figure out if blockchain makes sense for your business, and if it does, we'll show you the best way to use it.",
      details: "Think of us as your blockchain guide. We help you understand what blockchain can actually do for your business (beyond the hype), help you choose the right technology, and create a realistic plan to get there. No confusing tech speak - just practical advice.",
      expandedContent: {
        process: ["Initial consultation to understand your business goals", "Market research and blockchain feasibility analysis", "Technology recommendation and roadmap creation", "Implementation timeline and resource planning"],
        benefits: ["Avoid costly mistakes from jumping into blockchain too early", "Get a clear understanding of real vs. hype", "Save time with expert guidance instead of trial and error", "Connect with the right technical partners"],
        timeline: "2-4 weeks",
        deliverables: "Strategy document, technology recommendations, implementation roadmap"
      },
      image: "/api/placeholder/80/80",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Token Launch Consultation",
      description: "Planning to launch your own token? We'll walk you through everything - from legal requirements to getting people excited about your project.",
      details: "Launching a token involves way more than just the technical stuff. We help with the legal paperwork, building your community, creating buzz around your project, and making sure everything goes smoothly from day one.",
      expandedContent: {
        process: ["Legal compliance and regulatory guidance", "Tokenomics design and economic modeling", "Community building and marketing strategy", "Launch preparation and execution support"],
        benefits: ["Navigate complex legal requirements safely", "Build a sustainable token economy", "Create genuine community interest", "Launch with confidence and proper preparation"],
        timeline: "4-8 weeks",
        deliverables: "Token design document, legal compliance guide, marketing strategy, launch checklist"
      },
      image: "/api/placeholder/80/80",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Blockchain Integration Advisory",
      description: "Not sure which blockchain to build on or which tools to use? We'll help you pick the right technology for your specific needs.",
      details: "There are tons of blockchain platforms and tools out there. We help you cut through the noise and choose what actually works best for your project. We'll also connect you with reliable development teams and service providers.",
      expandedContent: {
        process: ["Requirements analysis and technical assessment", "Blockchain platform comparison and selection", "Architecture design and scalability planning", "Development partner recommendations"],
        benefits: ["Choose the right technology from the start", "Avoid expensive platform migrations later", "Get connected with proven development teams", "Build on a solid technical foundation"],
        timeline: "1-2 weeks",
        deliverables: "Technology recommendation report, architecture blueprint, partner referrals"
      },
      image: "/api/placeholder/80/80",
      color: "from-orange-500 to-red-500"
    }
  ]

  useEffect(() => {
    setIsLoaded(true)
    
    // Check for success parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success')) {
      setShowSuccess(true)
      // Clean URL
      router.replace('/')
    }
    
    if (isAuthenticated) {
      fetchCurrentSubscription()
      
      // Handle pending subscription after login
      const pendingSubscription = localStorage.getItem('pendingSubscription')
      if (pendingSubscription) {
        try {
          const { planId, billingCycle } = JSON.parse(pendingSubscription)
          localStorage.removeItem('pendingSubscription')
          // Proceed with the subscription flow
          handleGetStarted(planId)
        } catch (error) {
          console.error("Error processing pending subscription:", error)
          localStorage.removeItem('pendingSubscription')
        }
      }

      // Check for pending subscription form after authentication
      const pendingSubscriptionForm = localStorage.getItem('pendingSubscriptionForm')
      if (pendingSubscriptionForm && isAuthenticated) {
        try {
          const formData = JSON.parse(pendingSubscriptionForm)
          localStorage.removeItem('pendingSubscriptionForm')
          
          // Find the plan and show the subscription form with pre-filled data
          const plan = SUBSCRIPTION_PLANS.find(p => p.id === formData.planId)
          if (plan) {
            setSelectedPlan(plan)
            setShowSubscriptionForm(true)
          }
        } catch (error) {
          console.error("Error processing pending subscription form:", error)
          localStorage.removeItem('pendingSubscriptionForm')
        }
      }
    }
    
    const interval = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % services.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [services.length, isAuthenticated, router])

  const fetchCurrentSubscription = async () => {
    if (!session) return
    
    try {
      const response = await fetch('/api/subscriptions/manage')
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    }
  }

  const handleGetStarted = async (planId: string) => {
    // For Basic (free) plan, redirect to guest booking
    if (planId === "BASIC_FREE") {
      router.push('/guest-booking')
      return
    }

    // For paid plans, check if user is logged in
    if (!isAuthenticated) {
      // Store the selected plan and redirect to login
      localStorage.setItem('pendingSubscription', JSON.stringify({ planId, billingCycle: 'MONTHLY' }))
      router.push('/auth/unified-signin?redirect=subscription&plan=' + planId)
      return
    }

    // User is logged in, show the subscription form
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (plan) {
      setSelectedPlan(plan)
      setShowSubscriptionForm(true)
    }
  }

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionForm(false)
    setSelectedPlan(null)
    setShowSuccess(true)
  }

  const handleSubscriptionClose = () => {
    setShowSubscriptionForm(false)
    setSelectedPlan(null)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? null : index)
  }

  return (
    <>
      {/* Enhanced Navigation */}
      <EnhancedNavigation />
      
      {/* Enhanced Landing Page with Wingbits-inspired design */}
      <EnhancedLandingPage />

      {/* Subscription Form Modal - kept from original for functionality */}
      {selectedPlan && isAuthenticated && (
        <SubscriptionForm
          plan={selectedPlan}
          isOpen={showSubscriptionForm}
          onClose={handleSubscriptionClose}
          onSuccess={handleSubscriptionSuccess}
          context="homepage"
        />
      )}
    </>
  )
}