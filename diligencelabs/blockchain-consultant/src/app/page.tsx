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
import { SubtleBorder, ProminentBorder } from "@/components/ui/border-effects"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"
import { Logo } from "@/components/ui/logo"

// Dynamically import heavy background components for better initial load
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

const SectionGridLines = dynamic(() => import("@/components/ui/grid-lines").then(mod => ({ default: mod.SectionGridLines })), {
  ssr: false,
  loading: () => null
})

const HorizontalDivider = dynamic(() => import("@/components/ui/section-divider").then(mod => ({ default: mod.HorizontalDivider })), {
  ssr: false,
  loading: () => null
})

const PageStructureLines = dynamic(() => import("@/components/ui/page-structure").then(mod => ({ default: mod.PageStructureLines })), {
  ssr: false,
  loading: () => null
})

const DynamicPageBackground = dynamic(() => import("@/components/ui/dynamic-page-background").then(mod => ({ default: mod.DynamicPageBackground })), {
  ssr: false,
  loading: () => null
})

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

  const services = [
    {
      title: "Strategic Advisory",
      description: "Navigate complex blockchain landscapes with expert guidance on technology decisions, regulatory compliance, and market positioning strategies.",
      details: "Our strategic advisory services help you make informed decisions about blockchain adoption, technology stack selection, and go-to-market strategies. We provide comprehensive market analysis, competitive positioning, and roadmap development.",
      image: "/api/placeholder/80/80",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Due Diligence",
      description: "Comprehensive analysis of technical architecture, team capabilities, tokenomics, and market potential for investment decisions.",
      details: "Deep-dive technical and business analysis covering code audits, team assessment, market opportunity evaluation, competitive analysis, and risk assessment. Perfect for investors, partners, and stakeholders.",
      image: "/api/placeholder/80/80",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Token Launch Consultation",
      description: "End-to-end guidance for successful token launches including regulatory compliance, marketing strategy, and technical implementation.",
      details: "Complete token launch support from concept to execution. Includes legal compliance, technical implementation, marketing strategy, community building, and post-launch optimization.",
      image: "/api/placeholder/80/80",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Blockchain Integration Advisory",
      description: "Strategic guidance on blockchain deployment choices, technical solution providers, and white label services for optimal project implementation.",
      details: "Expert advisory on blockchain selection, infrastructure partners, development frameworks, and third-party integrations. We help identify the best technical solution providers and white label services to accelerate your blockchain project deployment.",
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
      router.replace('/', undefined, { shallow: true })
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Page Background with Enhanced Effects */}
      <DynamicPageBackground variant="default" opacity={0.25} />
      
      {/* Page Structure Lines */}
      <PageStructureLines />
      
      {/* Sophisticated Grid Lines System */}
      <HeroGridLines />
      
      {/* Parallax Background */}
      <ParallaxBackground />
      {/* Floating Elements */}
      <FloatingElements />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-4 sm:p-6 lg:p-8">
        <div className={`transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <Logo size="xl" />
        </div>
        <div className={`flex items-center space-x-2 sm:space-x-4 lg:space-x-6 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          {/* Desktop Navigation */}
          <Link href="#services" className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm lg:text-base">
            Services
          </Link>
          <Link href="#subscription" className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm lg:text-base">
            Pricing
          </Link>
          <Link href="/about" className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm lg:text-base">
            About
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Button asChild className="bg-white text-black hover:bg-gray-200 text-sm px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
            <Link href={isAuthenticated ? "/dashboard" : "/auth/unified-signin"}>
              Get Started
            </Link>
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800 z-40">
            <div className="flex flex-col py-4 px-6 space-y-4">
              <Link 
                href="#services" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Services
              </Link>
              <Link 
                href="#subscription" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Enhanced Border Grid */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        {/* Enhanced Grid Pattern for Hero Section */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.08)_1px,transparent_1px)] bg-[size:8rem_8rem]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:16rem_16rem]" />
        </div>
        
        <div className={`space-y-6 sm:space-y-8 max-w-6xl px-4 transition-all duration-1000 delay-500 relative z-20 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-light leading-tight relative">
            <span className="block">Expert</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-normal relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 blur-xl rounded-lg transform scale-110" />
              Blockchain
            </span>
            <span className="block">Consulting</span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-2">
            Strategic guidance, due diligence, and technical expertise for your blockchain ventures.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12 px-4">
            <Button asChild size="lg" className="group relative bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 rounded-full shadow-2xl shadow-green-500/25 hover:scale-105 transition-all duration-300 overflow-hidden min-h-[3rem] sm:min-h-[3.5rem]">
              <Link href="/guest-booking" className="relative z-10 flex items-center justify-center">
                <span className="relative flex items-center">
                  <span className="bg-white text-green-600 text-xs px-2 py-1 rounded-full mr-2 sm:mr-3 font-bold">FREE</span>
                  <span className="hidden sm:inline">Start With Free Consultation</span>
                  <span className="sm:hidden">Free Consultation</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-emerald-400/30 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-all duration-500" />
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group relative border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 rounded-full backdrop-blur transition-all duration-300 hover:scale-105 overflow-hidden min-h-[3rem] sm:min-h-[3.5rem]">
              <Link href="#subscription" className="relative z-10 flex items-center justify-center">
                <span className="relative">
                  <span className="hidden sm:inline">View Pricing Plans</span>
                  <span className="sm:hidden">Pricing</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/20 to-cyan-500/10 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500" />
                <div className="absolute inset-0 border border-white/50 rounded-full opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-all duration-500" />
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <HorizontalDivider style="prominent" />

      {/* Services Preview */}
      <section id="services" className="relative z-10 py-20 px-4">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-light mb-4">
              What We <span className="font-normal">Deliver</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive blockchain expertise across strategy, technology, and market dynamics
            </p>
          </div>

          {/* Enhanced Service Cards with Sophisticated Borders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <SubtleBorder
                key={index}
                className={`rounded-3xl overflow-hidden transition-all duration-700 hover:scale-105 ${
                  index === currentService ? 'scale-105' : ''
                }`}
                animated={true}
                movingBorder={true}
              >
                <div
                  className={`relative group p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 ${
                    index === currentService ? 'bg-gradient-to-br from-blue-900/20 to-gray-800/30' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 200}ms`
                  }}
                >
                {/* Dynamic background gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-3xl"
                  style={{
                    background: service.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, rgb(59 130 246 / 0.2), rgb(6 182 212 / 0.2))' :
                               service.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(135deg, rgb(168 85 247 / 0.2), rgb(236 72 153 / 0.2))' :
                               service.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(135deg, rgb(34 197 94 / 0.2), rgb(16 185 129 / 0.2))' :
                               service.color === 'from-orange-500 to-red-500' ? 'linear-gradient(135deg, rgb(249 115 22 / 0.2), rgb(239 68 68 / 0.2))' : 
                               'linear-gradient(135deg, rgb(59 130 246 / 0.2), rgb(6 182 212 / 0.2))'
                  }}
                />
                
                <div className="relative z-10">
                  {/* Service Image */}
                  <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-3 sm:p-4 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6"
                      style={{
                        background: service.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, rgb(59 130 246), rgb(6 182 212))' :
                                   service.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(135deg, rgb(168 85 247), rgb(236 72 153))' :
                                   service.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))' :
                                   service.color === 'from-orange-500 to-red-500' ? 'linear-gradient(135deg, rgb(249 115 22), rgb(239 68 68))' : 
                                   'linear-gradient(135deg, rgb(59 130 246), rgb(6 182 212))'
                      }}
                    >
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-light mb-2">{service.title}</h3>
                      <div 
                        className="w-16 h-1 rounded-full"
                        style={{
                          background: service.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(90deg, rgb(59 130 246), rgb(6 182 212))' :
                                     service.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(90deg, rgb(168 85 247), rgb(236 72 153))' :
                                     service.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(90deg, rgb(34 197 94), rgb(16 185 129))' :
                                     service.color === 'from-orange-500 to-red-500' ? 'linear-gradient(90deg, rgb(249 115 22), rgb(239 68 68))' : 
                                     'linear-gradient(90deg, rgb(59 130 246), rgb(6 182 212))'
                        }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed mb-4 text-base sm:text-lg">{service.description}</p>
                  <p className="text-gray-500 leading-relaxed text-sm">{service.details}</p>
                  
                  {/* Learn More Link */}
                  <div className="mt-6">
                    <a href="#" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                      Learn More
                      <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
                <div 
                  className="absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{
                    background: service.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(90deg, rgb(59 130 246), rgb(6 182 212))' :
                               service.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(90deg, rgb(168 85 247), rgb(236 72 153))' :
                               service.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(90deg, rgb(34 197 94), rgb(16 185 129))' :
                               service.color === 'from-orange-500 to-red-500' ? 'linear-gradient(90deg, rgb(249 115 22), rgb(239 68 68))' : 
                               'linear-gradient(90deg, rgb(59 130 246), rgb(6 182 212))'
                  }}
                />
                </div>
              </SubtleBorder>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <HorizontalDivider style="accent" />

      {/* Process Section */}
      <section className="relative z-10 py-20 px-4">
        <SectionGridLines />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4">
              Our Proven <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Process</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A systematic approach to blockchain consulting that delivers measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: "01",
                title: "Discovery & Analysis",
                description: "Deep dive into your project requirements, technical architecture, and business objectives with comprehensive market research",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "Strategic Planning",
                description: "Develop comprehensive roadmap with detailed risk assessment, realistic timeline, and optimal resource allocation strategy",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Implementation",
                description: "Execute recommendations with hands-on support, continuous monitoring, and rigorous quality assurance protocols",
                color: "from-emerald-500 to-teal-500"
              },
              {
                step: "04",
                title: "Optimization",
                description: "Continuous improvement through performance monitoring, data analysis, and post-launch optimization strategies",
                color: "from-orange-500 to-red-500"
              }
            ].map((process, index) => (
              <div 
                key={index} 
                className="relative group h-full transition-all duration-1000"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <ProminentBorder 
                  className="rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 h-full" 
                  animated={true}
                  movingBorder={true}
                >
                  <div className="p-8 bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl hover:bg-gradient-to-br hover:from-gray-900/80 hover:to-gray-800/50 transition-all duration-500 flex flex-col h-full min-h-[280px]">
                    <div className="flex flex-col items-start mb-6 flex-shrink-0">
                      <div className={`text-5xl font-light mb-3 bg-gradient-${process.color} bg-clip-text text-transparent opacity-70`}>
                        {process.step}
                      </div>
                      <div className={`w-16 h-0.5 bg-gradient-${process.color} rounded-full`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 leading-tight flex-shrink-0">{process.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm flex-grow">{process.description}</p>
                  </div>
                </ProminentBorder>
                
                {/* Connecting line with enhanced styling - improved positioning */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div 
                      className="w-6 h-0.5 bg-gradient-to-r from-white/30 to-transparent rounded-full"
                      style={{
                        boxShadow: '0 0 6px rgba(255, 255, 255, 0.15)'
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subsection Divider */}
          <div className="flex justify-center my-10">
            <HorizontalDivider style="subtle" className="max-w-2xl" />
          </div>

          {/* Expertise Areas with Enhanced Borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <SubtleBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="text-center group p-8 bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                  <div className="w-10 h-10 bg-white/20 rounded-lg" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">DeFi & Web3</h3>
                <p className="text-gray-400 leading-relaxed">Deep expertise in decentralized finance protocols, yield farming strategies, automated market makers, and cutting-edge Web3 infrastructure development</p>
              </div>
            </SubtleBorder>
            
            <SubtleBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="text-center group p-8 bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                  <div className="w-10 h-10 bg-white/20 rounded-lg" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Enterprise Blockchain</h3>
                <p className="text-gray-400 leading-relaxed">Strategic guidance for enterprise blockchain adoption, supply chain optimization, digital transformation initiatives, and regulatory compliance</p>
              </div>
            </SubtleBorder>
            
            <SubtleBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="text-center group p-8 bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/25">
                  <div className="w-10 h-10 bg-white/20 rounded-lg" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Token Economics</h3>
                <p className="text-gray-400 leading-relaxed">Advanced token launch consultation, governance model optimization, sustainable economic mechanisms, and innovative incentive structures</p>
              </div>
            </SubtleBorder>
          </div>

          {/* Final Subsection Divider */}
          <div className="flex justify-center my-8">
            <HorizontalDivider style="subtle" className="max-w-md" />
          </div>

        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="subscription" className="relative z-10 py-20 px-4">
        <style jsx>{`
          @keyframes float-up {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          
          @keyframes glow-pulse {
            0%, 100% { 
              box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
            }
            50% { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
            }
          }
          
          .animation-delay-300 {
            animation-delay: 300ms;
          }
          
          .animation-delay-500 {
            animation-delay: 500ms;
          }
          
          .text-shadow-glow {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4">
              Monthly <span className="font-normal bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Subscription Plans</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get unlimited access to expert blockchain consulting with our monthly subscription plans. 
              Save up to 40% compared to individual consultations.
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-12">
              <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
                <div className="relative group bg-gradient-to-br from-green-900/60 to-emerald-800/30 backdrop-blur-xl rounded-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                  
                  <Card className="bg-transparent border-0 relative z-10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Subscription Successful!
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Welcome to your new subscription plan. You now have access to consultation credits.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-400 text-sm">
                            Your consultation credits are now active. Visit your dashboard to book your first consultation.
                          </p>
                        </div>
                        {session && (
                          <Link href="/dashboard">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                              Go to Dashboard
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ProminentBorder>
            </div>
          )}

          {/* Current Subscription Info (if logged in and has subscription) */}
          {session && currentSubscription && (
            <div className="mb-12">
              <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
                <div className="relative group bg-gradient-to-br from-green-900/60 to-emerald-800/30 backdrop-blur-xl rounded-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                  
                  <Card className="bg-transparent border-0 relative z-10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Your Active Subscription
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        You have an active {currentSubscription.planType.replace('_', ' ').toLowerCase()} subscription
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            {currentSubscription.status}
                          </Badge>
                          <p className="text-sm text-gray-400 mt-2">
                            Next billing: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${currentSubscription.amount}</p>
                          <p className="text-sm text-gray-400">per month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ProminentBorder>
            </div>
          )}

          {/* Pricing Cards with Perfect Horizontal Alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto px-2 sm:px-4">
            {SUBSCRIPTION_PLANS.map((plan, index) => {
              const isCurrentPlan = currentSubscription?.planType === plan.id
              const isSubscribing = subscribing === plan.id

              return (
                <div key={plan.id} className="relative flex flex-col group/card">
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-500 group-hover/card:scale-110 group-hover/card:-translate-y-1">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1.5 text-xs font-semibold shadow-lg rounded-full animate-pulse group-hover/card:animate-none group-hover/card:shadow-blue-500/50 group-hover/card:shadow-2xl">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <ProminentBorder 
                    className="rounded-2xl overflow-hidden flex-1 mt-4 transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-2xl" 
                    animated={plan.popular} 
                    movingBorder={plan.popular}
                  >
                    <div className={`relative group backdrop-blur-xl rounded-2xl transition-all duration-700 flex flex-col min-h-[520px] group-hover/card:-translate-y-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-blue-900/60 to-cyan-800/30 hover:shadow-2xl hover:shadow-blue-500/30 group-hover/card:from-blue-800/80 group-hover/card:to-cyan-700/50' 
                        : 'bg-gradient-to-br from-gray-900/60 to-gray-800/30 hover:shadow-2xl hover:shadow-gray-500/20 group-hover/card:from-gray-800/80 group-hover/card:to-gray-700/50'
                    }`}>
                      {/* Animated Background Overlay */}
                      <div className={`absolute inset-0 opacity-0 group-hover/card:opacity-30 transition-all duration-700 rounded-2xl ${
                        plan.popular 
                          ? 'bg-gradient-to-br from-blue-400/20 to-cyan-400/20' 
                          : plan.price.monthly === 0
                          ? 'bg-gradient-to-br from-green-400/15 to-emerald-400/15'
                          : 'bg-gradient-to-br from-purple-400/15 to-pink-400/15'
                      }`} />
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-all duration-1000 rounded-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out"></div>
                      </div>
                      
                      <Card className="bg-transparent border-0 relative z-10 flex-1 flex flex-col">
                        {/* Header Section - Fixed Height */}
                        <CardHeader className="text-center pb-4 flex-shrink-0 pt-6 relative">
                          <CardTitle className="text-lg lg:text-xl text-white mb-3 h-7 flex items-center justify-center transition-all duration-500 group-hover/card:scale-110 group-hover/card:text-shadow-glow">
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400 h-10 flex items-center justify-center text-xs lg:text-sm leading-tight px-1 transition-all duration-500 group-hover/card:text-gray-300">
                            {plan.description}
                          </CardDescription>
                          <div className="mt-4 relative">
                            <div className={`text-2xl lg:text-3xl font-bold leading-none h-8 flex items-center justify-center transition-all duration-500 group-hover/card:scale-125 ${
                              plan.popular 
                                ? 'text-blue-400 group-hover/card:text-cyan-300'
                                : plan.price.monthly === 0
                                ? 'text-green-400 group-hover/card:text-emerald-300'
                                : 'text-white group-hover/card:text-purple-300'
                            }`}>
                              ${plan.price.monthly}
                              {/* Floating particles around price */}
                              <div className="absolute -inset-4 opacity-0 group-hover/card:opacity-100 transition-all duration-700">
                                <div className="absolute top-0 left-0 w-1 h-1 bg-current rounded-full animate-ping"></div>
                                <div className="absolute top-1 right-2 w-0.5 h-0.5 bg-current rounded-full animate-pulse"></div>
                                <div className="absolute bottom-0 right-0 w-1 h-1 bg-current rounded-full animate-ping animation-delay-300"></div>
                                <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-current rounded-full animate-pulse animation-delay-500"></div>
                              </div>
                            </div>
                            <div className="text-gray-400 text-xs mt-1 h-4 flex items-center justify-center transition-all duration-500 group-hover/card:text-gray-300 group-hover/card:scale-105">per month</div>
                          </div>
                        </CardHeader>

                        {/* Features Section - Flexible Height */}
                        <CardContent className="flex-1 flex flex-col px-4 lg:px-6">
                          <ul className="space-y-2.5 flex-1 min-h-[240px]">
                            {plan.features.map((feature, featureIndex) => (
                              <li 
                                key={featureIndex} 
                                className="flex items-start space-x-2 transition-all duration-500 opacity-90 group-hover/card:opacity-100 group-hover/card:translate-x-1"
                                style={{ 
                                  transitionDelay: `${featureIndex * 75}ms` 
                                }}
                              >
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all duration-500 group-hover/card:scale-125 group-hover/card:rotate-12 ${
                                  feature.included 
                                    ? 'bg-green-500/20 group-hover/card:bg-green-400/40 group-hover/card:shadow-lg group-hover/card:shadow-green-400/50' 
                                    : 'bg-gray-600/20 group-hover/card:bg-gray-500/30'
                                }`}>
                                  {feature.included ? (
                                    <svg className="w-2.5 h-2.5 text-green-400 group-hover/card:text-green-300 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-2.5 h-2.5 text-gray-500 group-hover/card:text-gray-400 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-xs lg:text-sm leading-relaxed transition-all duration-500 ${
                                  feature.included 
                                    ? 'text-gray-300 group-hover/card:text-white' 
                                    : 'text-gray-500 group-hover/card:text-gray-400'
                                }`}>
                                  {feature.name}
                                  {feature.limit && <span className="text-gray-400 group-hover/card:text-gray-300"> ({feature.limit})</span>}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* Button Section - Fixed Height */}
                          <div className="pt-4 mt-auto flex-shrink-0 relative">
                            {isCurrentPlan ? (
                              <Button disabled className="w-full bg-green-600 hover:bg-green-600 text-white py-2 rounded-lg font-medium h-10 text-sm relative overflow-hidden">
                                <span className="relative z-10">Current Plan</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleGetStarted(plan.id)}
                                disabled={isSubscribing}
                                size="lg"
                                className={`w-full transition-all duration-500 group-hover/card:scale-110 group-hover/card:shadow-2xl py-2 rounded-lg font-medium shadow-lg h-10 text-sm relative overflow-hidden group/button ${
                                  plan.price.monthly === 0
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-green-500/25 group-hover/card:shadow-green-500/50'
                                    : plan.popular
                                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-blue-500/25 group-hover/card:shadow-blue-500/50'
                                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/25 group-hover/card:shadow-purple-500/50'
                                }`}
                              >
                                <span className="relative z-10 transition-all duration-300 group-hover/button:scale-105">
                                  {isSubscribing ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2 inline-block"></div>
                                      Processing...
                                    </>
                                  ) : plan.price.monthly === 0 ? (
                                    'Claim Free Consultation'
                                  ) : !isAuthenticated ? (
                                    'Sign Up & Subscribe'
                                  ) : currentSubscription ? (
                                    'Upgrade Plan'
                                  ) : (
                                    'Get Started'
                                  )}
                                </span>
                                
                                {/* Animated background effects */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-200%] group-hover/card:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                                
                                {/* Pulsing border effect */}
                                <div className="absolute inset-0 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                                  <div className={`absolute inset-0 rounded-lg animate-pulse ${
                                    plan.price.monthly === 0
                                      ? 'ring-2 ring-green-400/50'
                                      : plan.popular
                                      ? 'ring-2 ring-blue-400/50'
                                      : 'ring-2 ring-purple-400/50'
                                  }`}></div>
                                </div>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ProminentBorder>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Section Divider */}
      <HorizontalDivider style="prominent" />

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4">
              Let's Discuss Your <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Project</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Have a specific project in mind? Need custom consultation? Get in touch with our blockchain experts to explore how we can accelerate your initiatives.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Final Section Divider */}
      <HorizontalDivider style="subtle" />

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div>
            <Logo size="large" />
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-gray-400 text-sm sm:text-base">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Subscription Form Modal - Only show for authenticated users */}
      {selectedPlan && isAuthenticated && (
        <SubscriptionForm
          plan={selectedPlan}
          isOpen={showSubscriptionForm}
          onClose={handleSubscriptionClose}
          onSuccess={handleSubscriptionSuccess}
          context="homepage"
        />
      )}
    </div>
  )
}
