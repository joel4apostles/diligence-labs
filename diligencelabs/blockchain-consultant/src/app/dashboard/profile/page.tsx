"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal"
import { PrivacySettingsModal } from "@/components/profile/PrivacySettingsModal"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading, LoadingSpinner } from "@/components/ui/loading-states"
import { 
  PageWrapper, 
  GlassMorphismCard, 
  FloatingOrb,
  theme,
  animations
} from "@/components/ui/consistent-theme"
import { motion } from "framer-motion"

export default function Profile() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { ready, authenticated, user, logout } = usePrivy()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [creditBalance, setCreditBalance] = useState<any>(null)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showPrivacySettingsModal, setShowPrivacySettingsModal] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/unified-signin")
      return
    }
    
    setIsPageLoaded(true)
    
    // Fetch subscription data
    fetchSubscriptionData()
    
    // Sync wallet address if connected via Privy
    if (ready && authenticated && user?.wallet?.address) {
      syncWalletAddress(user.wallet.address)
    }
  }, [session, router, ready, authenticated, user])

  const fetchSubscriptionData = async () => {
    if (!session) return
    
    try {
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscriptions/manage'),
        fetch('/api/subscriptions/usage')
      ])

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setCurrentSubscription(subscriptionData.subscription)
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setCreditBalance(usageData.creditBalance)
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error)
    }
  }

  const handleGetStarted = async (planId: string) => {
    if (!session) {
      router.push('/auth/unified-signin')
      return
    }

    try {
      setSubscribing(planId)
      
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle: 'MONTHLY'
        })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        console.error("Failed to create checkout session:", data.error)
      }
    } catch (error) {
      console.error("Error creating subscription:", error)
    } finally {
      setSubscribing(null)
    }
  }

  const syncWalletAddress = async (walletAddress: string) => {
    try {
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
      
      if (response.ok) {
        // Update session to reflect the new wallet address
        await update()
      }
    } catch (error) {
      console.error("Failed to sync wallet address:", error)
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      logout()
      
      // Remove wallet address from profile
      const response = await fetch("/api/user/wallet", {
        method: "DELETE",
      })
      
      if (response.ok) {
        await update()
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })
      
      if (response.ok) {
        await update()
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!session) {
    return <PageLoading message="Loading your profile..." />
  }

  return (
    <DashboardErrorBoundary>
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
        <motion.div 
          {...animations.slideDown}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-12"
        >
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← Back to Dashboard
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Logo size="xl" href={null} />
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-lg text-gray-400">Profile Settings</div>
            </div>
            <h1 className="text-4xl font-light mb-2">
              <span className="font-normal text-white">Account Management</span>
            </h1>
            <p className="text-gray-400 text-lg">Manage your account information and preferences</p>
          </div>
        </motion.div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-8xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* 1. Profile Information - Strategic Advisory Theme (Blue-Cyan) */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-500">
                        This is used for account login and important notifications
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">Account Role</Label>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                          {session.user?.role || "USER"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Your current access level in the platform
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                    >
                      {isUpdating ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 2. Blockchain Wallet - Due Diligence Theme (Purple-Pink) */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Blockchain Wallet</CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect your blockchain wallet to enable Web3 features and verify your identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!ready || !authenticated || !user?.wallet ? (
                    <div className="space-y-4">
                      <div className="text-center py-8 border-2 border-dashed border-purple-500/30 bg-purple-500/5 rounded-lg">
                        <div className="text-4xl mb-4">🔗</div>
                        <h3 className="font-semibold mb-2 text-white">No Wallet Connected</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Connect your blockchain wallet to access advanced features
                        </p>
                        <Button
                          onClick={() => {
                            // If user is already logged in with NextAuth but no wallet, try to connect via Privy
                            if (session) {
                              router.push('/auth/unified-signin?mode=wallet')
                            } else {
                              router.push('/auth/unified-signin')
                            }
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          Connect Wallet
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Benefits of connecting your wallet:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Verify wallet ownership for enhanced security</li>
                          <li>• Access tokenomics and DeFi consultation features</li>
                          <li>• Sign documents and reports with blockchain verification</li>
                          <li>• Receive NFT certificates for completed consultations</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-green-500/30 rounded-lg bg-green-500/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <div>
                            <p className="font-medium text-white">Wallet Connected</p>
                            <p className="text-sm text-gray-400 font-mono">
                              {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleDisconnectWallet}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Wallet Features Available:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-gray-300">Identity Verification</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-gray-300">Document Signing</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-gray-300">NFT Certificates</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-gray-300">Advanced Features</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. Account Security - Token Launch Theme (Green-Emerald) */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-green-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Account Security</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Password</Label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowChangePasswordModal(true)}
                      className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                    >
                      Change Password
                    </Button>
                    <p className="text-xs text-gray-500">
                      Update your account password for better security
                    </p>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Two-Factor Authentication</Label>
                    <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                      Enable 2FA (Coming Soon)
                    </Button>
                    <p className="text-xs text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Data & Privacy</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/user/download-data')
                            if (response.ok) {
                              const contentDisposition = response.headers.get('Content-Disposition')
                              const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
                              const filename = filenameMatch ? filenameMatch[1] : 'user-data.json'
                              
                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = filename
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              window.URL.revokeObjectURL(url)
                            }
                          } catch (error) {
                            console.error('Failed to download data:', error)
                          }
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                      >
                        Download My Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowPrivacySettingsModal(true)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                      >
                        Privacy Settings
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Manage your personal data and privacy preferences
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 4. Subscription Management - Orange-Red Theme */}
          <div className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 h-full rounded-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Subscription Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your subscription plan and view usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentSubscription ? (
                    <div className="space-y-4">
                      {/* Current Plan */}
                      <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">Current Plan</h4>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {currentSubscription.status}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-white mb-1">
                          {currentSubscription.planType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-400">
                          ${currentSubscription.amount} per {currentSubscription.billingCycle?.toLowerCase() || 'month'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Next billing: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Credit Balance */}
                      {creditBalance && (
                        <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">Credits Available</h4>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-2xl font-bold text-green-400">
                                {creditBalance.isUnlimited ? '∞' : creditBalance.remainingCredits}
                              </p>
                              <p className="text-xs text-gray-500">
                                {creditBalance.isUnlimited ? 'Unlimited consultations' : 'consultations remaining'}
                              </p>
                            </div>
                            {!creditBalance.isUnlimited && (
                              <div className="flex-1">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${Math.max(10, (creditBalance.remainingCredits / (creditBalance.remainingCredits + creditBalance.usedCredits || 1)) * 100)}%` 
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {creditBalance.usedCredits || 0} used this period
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        <Link href="/#subscription">
                          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300">
                            View All Plans
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                          Manage Billing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8 border-2 border-dashed border-orange-500/30 bg-orange-500/5 rounded-lg">
                        <div className="text-4xl mb-4">💳</div>
                        <h3 className="font-semibold mb-2 text-white">No Active Subscription</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Subscribe to get unlimited consultations and save money
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Subscription Benefits:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Save up to 40% compared to individual consultations</li>
                          <li>• Priority scheduling and support</li>
                          <li>• Access to premium features and reports</li>
                          <li>• Dedicated account management</li>
                        </ul>
                      </div>
                      
                      <Link href="/#subscription">
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300">
                          View Subscription Plans
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => {
            // Optionally show a success message or update UI
            console.log('Password changed successfully')
          }}
        />

        <PrivacySettingsModal
          isOpen={showPrivacySettingsModal}
          onClose={() => setShowPrivacySettingsModal(false)}
        />
      </div>
      </PageWrapper>
    </DashboardErrorBoundary>
  )
}