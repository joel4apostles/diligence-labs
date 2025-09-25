"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useUnifiedAuth } from "@/components/providers/unified-auth-provider"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FloatingElements } from "@/components/ui/animated-background"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { SectionGridLines } from "@/components/ui/grid-lines"
import { SubtleBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { PAID_SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"
import { Logo } from "@/components/ui/logo"
import SubscriptionDashboard from "@/components/SubscriptionDashboard"
import dynamic from "next/dynamic"

// Remove problematic dynamic imports temporarily to fix SSR issue
// const SubscriptionForm = dynamic(() => import("@/components/subscription").then(mod => ({ default: mod.SubscriptionForm })), {
//   loading: () => <div className="h-64 animate-pulse bg-gray-800/50 rounded-xl" />,
//   ssr: false
// })

function DashboardContent() {
  const { data: session, status } = useSession()
  const { user: unifiedUser, isLoading: unifiedLoading, isAuthenticated, logout } = useUnifiedAuth()
  // Enable wallet functionality
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [creditBalance, setCreditBalance] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Wait for both auth systems to be ready
    if (status === "loading" || unifiedLoading) return
    
    console.log('Dashboard auth check:', { 
      nextAuthStatus: status, 
      hasSession: !!session, 
      userId: session?.user?.id,
      isAuthenticated, 
      unifiedLoading 
    })
    
    // Prioritize NextAuth session for traditional login
    if (status === "authenticated" && session?.user) {
      console.log('NextAuth session valid, loading dashboard')
      setIsPageLoaded(true)
      // Load subscription data separately to avoid blocking page render
      setTimeout(() => fetchSubscriptionData(), 100)
    } else if (isAuthenticated && status !== "authenticated") {
      // Only use unified auth if NextAuth is not authenticated
      console.log('Unified auth valid, loading dashboard')
      setIsPageLoaded(true)
      // Load subscription data separately to avoid blocking page render
      setTimeout(() => fetchSubscriptionData(), 100)
    } else if (status === "unauthenticated" && !isAuthenticated && !unifiedLoading) {
      // Only redirect if both auth systems confirm no authentication
      console.log('No authentication found, redirecting to login')
      router.push("/auth/signin")
    }
    // If still loading or in transition state, wait
  }, [session, status, isAuthenticated, unifiedLoading, router])

  const fetchSubscriptionData = useCallback(async () => {
    if (!session) return
    
    try {
      console.log('Fetching subscription data...')
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscriptions/manage', {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/subscriptions/usage', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ])

      console.log('Subscription API responses:', {
        subscription: subscriptionResponse.status,
        usage: usageResponse.status
      })

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setSubscriptionData(subscriptionData.subscription)
      } else {
        console.log('Subscription API returned:', subscriptionResponse.status)
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setCreditBalance(usageData.creditBalance)
      } else {
        console.log('Usage API returned:', usageResponse.status)
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error)
      // Don't let subscription errors block the dashboard
    }
  }, [session])

  // Handle wallet connection sync
  useEffect(() => {
    const syncWalletAddress = async () => {
      if (isConnected && address && session?.user?.id) {
        try {
          const response = await fetch('/api/user/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          })
          
          if (response.ok) {
            console.log('Wallet address synced successfully')
          } else {
            console.error('Failed to sync wallet address')
          }
        } catch (error) {
          console.error('Error syncing wallet address:', error)
        }
      }
    }

    syncWalletAddress()
  }, [isConnected, address, session?.user?.id])

  const handleDisconnectWallet = useCallback(async () => {
    try {
      // Disconnect from wagmi
      disconnect()
      
      // Remove from user profile
      const response = await fetch('/api/user/wallet', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        console.log('Wallet disconnected successfully')
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }, [disconnect])

  const openSubscriptionModal = useCallback((plan: any) => {
    setSelectedPlan(plan)
    setIsSubscriptionModalOpen(true)
  }, [])

  const closeSubscriptionModal = useCallback(() => {
    setSelectedPlan(null)
    setIsSubscriptionModalOpen(false)
  }, [])

  const onSubscriptionSuccess = useCallback(() => {
    closeSubscriptionModal()
    // Refresh subscription data
    fetchSubscriptionData()
  }, [closeSubscriptionModal, fetchSubscriptionData])

  if (status === "loading" || unifiedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Dashboard Background */}
      <DynamicPageBackground variant="dashboard" opacity={0.2} />
      
      <PageStructureLines />
      <SectionGridLines />
      <ParallaxBackgroundLazy />
      <FloatingElementsLazy />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Logo size="xl" href={null} />
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-lg text-gray-400">Dashboard</div>
            </div>
            <h1 className="text-4xl font-light mb-2">
              Welcome back, <span className="font-normal text-white">
                {unifiedUser?.name || 'User'}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Manage your consulting services and subscriptions</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet Connection */}
            <div className="flex items-center gap-2">
              {isConnected && address ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  <Button 
                    onClick={handleDisconnectWallet}
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading'
                    const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <Button 
                                onClick={openConnectModal} 
                                variant="outline" 
                                size="sm"
                                className="border-blue-600 text-blue-400 hover:bg-blue-500/10 transition-all duration-300"
                              >
                                Connect Wallet
                              </Button>
                            )
                          }

                          return (
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 font-mono">
                                {account.address.slice(0, 6)}...{account.address.slice(-4)}
                              </div>
                              <Button 
                                onClick={handleDisconnectWallet}
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                              >
                                Disconnect
                              </Button>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  }}
                </ConnectButton.Custom>
              )}
            </div>
            
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300">
                Profile
              </Button>
            </Link>
            <Button onClick={() => logout()} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscriptionData && (
          <div className={`mb-8 transition-all duration-1000 delay-200 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <SubtleBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-blue-900/60 to-blue-800/30 backdrop-blur-xl rounded-xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                <Card className="bg-transparent border-0 relative z-10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {subscriptionData.planType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())} Plan
                          </h3>
                          <p className="text-sm text-gray-400">
                            Status: <span className="text-green-400 font-medium">{subscriptionData.status}</span> 
                            {creditBalance && (
                              <span className="ml-4">
                                Credits: <span className="text-blue-400 font-medium">
                                  {creditBalance.isUnlimited ? '∞' : creditBalance.remainingCredits}
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Next billing</p>
                          <p className="text-white font-medium">
                            {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href="/dashboard/profile">
                          <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SubtleBorder>
          </div>
        )}

        {/* Section Divider */}
        <HorizontalDivider style="subtle" />

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 transition-all duration-1000 delay-300 px-4 sm:px-0 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* 1. Strategic Advisory - Book Consultation */}
          <SubtleBorder className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Strategic Advisory</CardTitle>
              <CardDescription className="text-gray-400">Book consultation session</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Navigate complex blockchain landscapes with expert guidance on technology decisions and strategies.
              </p>
              <Link href="/dashboard/book-consultation">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">Book Now</Button>
              </Link>
            </CardContent>
              </Card>
            </div>
          </SubtleBorder>

          {/* 2. Due Diligence - My Sessions */}
          <SubtleBorder className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Due Diligence</CardTitle>
                  <CardDescription className="text-gray-400">View consultation history</CardDescription>
                </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Comprehensive analysis of technical architecture, team capabilities, and market potential for decisions.
              </p>
              <Link href="/dashboard/sessions">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">View Sessions</Button>
              </Link>
            </CardContent>
              </Card>
            </div>
          </SubtleBorder>

          {/* 3. Token Launch Consultation - Reports */}
          <SubtleBorder className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-green-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Token Launch</CardTitle>
                  <CardDescription className="text-gray-400">Access launch guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    End-to-end guidance for successful token launches including regulatory compliance and strategy.
                  </p>
                  <Link href="/dashboard/reports">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">View Reports</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </SubtleBorder>

          {/* 4. Blockchain Integration Advisory - New Card */}
          <SubtleBorder className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Blockchain Integration Advisory</CardTitle>
                  <CardDescription className="text-gray-400">Expert deployment guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Strategic guidance on blockchain deployment, solution providers, and white label services.
                  </p>
                  <Link href="/dashboard/request-report">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">Request Analysis</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </SubtleBorder>
        </div>

        {/* User Reputation & Subscription Management */}
        <div className={`mb-12 transition-all duration-1000 delay-400 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">
              <span className="font-normal text-white">Reputation & Subscriptions</span>
            </h2>
            <p className="text-gray-400">Track your progress and manage your subscription tier</p>
          </div>
          
          <SubscriptionDashboard />
        </div>

        {/* Section Divider */}
        <HorizontalDivider style="subtle" />

        {/* Subscription Plans Section - Only show if user doesn't have active subscription */}
        {!subscriptionData && (
          <div className={`mb-12 transition-all duration-1000 delay-400 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light mb-2">
                <span className="font-normal text-white">Upgrade Your Plan</span>
              </h2>
              <p className="text-gray-400">Subscribe to unlock premium consultation services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
              {PAID_SUBSCRIPTION_PLANS.map((plan, index) => (
                <SubtleBorder key={plan.id} className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
                  <div className={`relative group bg-gradient-to-br ${
                    index === 0 ? 'from-blue-900/60 to-blue-800/30 hover:shadow-blue-500/20' :
                    index === 1 ? 'from-purple-900/60 to-purple-800/30 hover:shadow-purple-500/20' :
                    'from-orange-900/60 to-orange-800/30 hover:shadow-orange-500/20'
                  } backdrop-blur-xl transition-all duration-700 hover:shadow-2xl h-full rounded-xl`}>
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br ${
                      index === 0 ? 'from-blue-500/20 to-cyan-500/20' :
                      index === 1 ? 'from-purple-500/20 to-pink-500/20' :
                      'from-orange-500/20 to-red-500/20'
                    }`} />
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-purple-500 to-pink-500' :
                      'from-orange-500 to-red-500'
                    } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                    
                    <Card className="bg-transparent border-0 relative z-10">
                      <CardHeader className="text-center">
                        {plan.popular && (
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium mx-auto w-fit mb-4">
                            Most Popular
                          </div>
                        )}
                        <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                        <div className="text-center mt-2">
                          <span className="text-3xl font-bold text-white">${plan.price.monthly}</span>
                          <span className="text-gray-400 ml-1">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6 text-sm">
                          {plan.features.slice(0, 4).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-gray-300">
                              <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature.name}
                              {feature.limit && <span className="text-gray-400"> ({feature.limit})</span>}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => openSubscriptionModal(plan)}
                          className={`w-full bg-gradient-to-r ${
                            index === 0 ? 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
                            index === 1 ? 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                            'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                          } transition-all duration-300`}
                        >
                          Subscribe to {plan.name}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </SubtleBorder>
              ))}
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="flex justify-center my-12">
          <HorizontalDivider style="subtle" className="max-w-2xl" />
        </div>

        {/* Profile & Settings Section */}
        <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light mb-2">
              <span className="font-normal text-white">Profile & Settings</span>
            </h2>
            <p className="text-gray-400">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4 sm:px-0">
            {/* Account Information - Strategic Advisory Theme (Blue-Cyan) */}
            <SubtleBorder className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 h-full rounded-xl">
                {/* Dynamic background gradient */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                
                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <Card className="bg-transparent border-0 relative z-10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <p className="text-sm text-gray-400">{unifiedUser?.email}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <p className="text-sm text-gray-400">{unifiedUser?.name || "Not set"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <p className="text-sm text-gray-400">{unifiedUser?.role || "USER"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Auth Provider</label>
                <p className="text-sm text-gray-400 capitalize">{unifiedUser?.authProvider || "Unknown"}</p>
              </div>

              {unifiedUser?.walletAddress && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Connected Wallet</label>
                  <p className="text-sm text-gray-400 font-mono bg-gray-800/50 px-3 py-2 rounded">
                    {unifiedUser.walletAddress.slice(0, 6)}...{unifiedUser.walletAddress.slice(-4)}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                    Manage Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
                </Card>
              </div>
            </SubtleBorder>

            {/* Quick Actions - Blockchain Integration Advisory Theme (Orange-Red) */}
            <SubtleBorder className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 h-full rounded-xl">
                {/* Dynamic background gradient */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
                
                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <Card className="bg-transparent border-0 relative z-10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/dashboard/services/strategic-advisory">
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                        Strategic Advisory
                      </Button>
                    </Link>
                    <Link href="/dashboard/services/due-diligence">
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                        Due Diligence
                      </Button>
                    </Link>
                    <Link href="/dashboard/services/token-launch">
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                        Token Launch Consultation
                      </Button>
                    </Link>
                    <Link href="/dashboard/services/blockchain-integration-advisory">
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                        Blockchain Integration Advisory
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </SubtleBorder>
          </div>
        </div>



        {/* Subscription Modal */}
        {selectedPlan && (
          <SubscriptionForm
            plan={selectedPlan}
            isOpen={isSubscriptionModalOpen}
            onClose={closeSubscriptionModal}
            onSuccess={onSubscriptionSuccess}
            context="dashboard"
          />
        )}
      </div>
    </div>
  )
}

// Create a dynamic import to avoid SSR issues with wagmi
const DashboardWrapper = dynamic(() => Promise.resolve(DashboardContent), { ssr: false })

export default function Dashboard() {
  return <DashboardWrapper />
}