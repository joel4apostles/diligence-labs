"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FloatingElements } from "@/components/ui/animated-background"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { useUnifiedAuth } from "@/components/providers/unified-auth-provider"

function UnifiedDashboardContent() {
  const { user, isLoading, isAuthenticated, logout } = useUnifiedAuth()
  const { address } = useAccount()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/unified-signin")
    } else if (isAuthenticated) {
      setIsPageLoaded(true)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <PageStructureLines />
      <ParallaxBackground />
      <FloatingElements />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
      
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div>
            <h1 className="text-4xl font-light mb-2">
              Welcome back, <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name || user.email}</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your Diligence Labs consulting services
              <span className="ml-2 text-xs bg-gray-800 px-2 py-1 rounded">
                via {user.authProvider === 'privy' ? 'Web3' : 'Traditional'} Auth
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300">
                Profile
              </Button>
            </Link>
            {user.authProvider === 'nextauth' && <ConnectButton />}
            <Button onClick={logout} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              Sign Out
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-xl text-white">Book Consultation</CardTitle>
              <CardDescription className="text-gray-400">Schedule a consultation session</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Get expert guidance on your blockchain project with our advisory services.
              </p>
              <Link href="/dashboard/book-consultation">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300">Book Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-xl text-white">My Sessions</CardTitle>
              <CardDescription className="text-gray-400">View your consultation history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Track your past and upcoming consultation sessions.
              </p>
              <Link href="/dashboard/sessions">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">View Sessions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-xl text-white">Reports & Analysis</CardTitle>
              <CardDescription className="text-gray-400">Access your due diligence reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Download and view your blockchain analysis reports.
              </p>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">View Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur border border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <p className="text-sm text-gray-400">{user.email || "Not available"}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <p className="text-sm text-gray-400">{user.name || "Not set"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Authentication Method</label>
                <p className="text-sm text-gray-400 capitalize">
                  {user.authProvider === 'privy' ? 'Web3 (Privy)' : 'Traditional (NextAuth)'}
                </p>
              </div>

              {user.role && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <p className="text-sm text-gray-400">{user.role}</p>
                </div>
              )}

              {(address || user.walletAddress) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Connected Wallet</label>
                  <p className="text-sm text-gray-400 font-mono bg-gray-800/50 px-3 py-2 rounded">
                    {(address || user.walletAddress)?.slice(0, 6)}...{(address || user.walletAddress)?.slice(-4)}
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

          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur border border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/request-report?type=DUE_DILIGENCE">
                <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                  Request Due Diligence
                </Button>
              </Link>
              <Link href="/dashboard/request-report?type=TECHNICAL_ANALYSIS">
                <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                  Technical Review
                </Button>
              </Link>
              <Link href="/dashboard/book-consultation?type=TOKENOMICS">
                <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                  Tokenomics Consultation
                </Button>
              </Link>
              <Link href="/dashboard/book-consultation?type=TOKEN_LAUNCH">
                <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                  Token Launch Consultation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Create a dynamic import to avoid SSR issues with wagmi
const UnifiedDashboardWrapper = dynamic(() => Promise.resolve(UnifiedDashboardContent), { ssr: false })

export default function UnifiedDashboard() {
  return <UnifiedDashboardWrapper />
}