"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUnifiedAuth } from "@/components/providers/unified-auth-provider"
import { ComprehensiveDashboardLayout } from "@/components/dashboard/comprehensive-dashboard-layout"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading } from "@/components/ui/loading-states"
import dynamic from "next/dynamic"

// Create a dynamic import to avoid SSR issues
const DashboardWrapper = dynamic(() => Promise.resolve(DashboardContent), { ssr: false })

function DashboardContent() {
  const { data: session, status } = useSession()
  const { user: unifiedUser, isLoading: unifiedLoading, isAuthenticated } = useUnifiedAuth()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Wait for both auth systems to be ready
    if (status === "loading" || unifiedLoading) return
    
    console.log('Enhanced Dashboard auth check:', { 
      nextAuthStatus: status, 
      hasSession: !!session, 
      userId: session?.user?.id,
      isAuthenticated, 
      unifiedLoading 
    })
    
    // Prioritize NextAuth session for traditional login
    if (status === "authenticated" && session?.user) {
      console.log('NextAuth session valid, loading enhanced dashboard')
      setIsPageLoaded(true)
    } else if (isAuthenticated && status !== "authenticated") {
      // Only use unified auth if NextAuth is not authenticated
      console.log('Unified auth valid, loading enhanced dashboard')
      setIsPageLoaded(true)
    } else if (status === "unauthenticated" && !isAuthenticated && !unifiedLoading) {
      // Only redirect if both auth systems confirm no authentication
      console.log('No authentication found, redirecting to login')
      router.push("/auth/unified-signin")
    }
  }, [session, status, isAuthenticated, unifiedLoading, router])

  if (status === "loading" || unifiedLoading) {
    return <PageLoading message="Loading your enhanced dashboard..." />
  }

  if (!isAuthenticated && !session?.user) {
    return null
  }

  // Prepare user data for the dashboard
  const dashboardUser = session?.user ? {
    id: session.user.id!,
    name: session.user.name,
    email: session.user.email!,
    role: session.user.role || 'USER',
    industry: (session.user as any).industry,
    experience: (session.user as any).experience,
    companySize: (session.user as any).companySize,
    budget: (session.user as any).budget
  } : unifiedUser ? {
    id: unifiedUser.id,
    name: unifiedUser.name,
    email: unifiedUser.email,
    role: unifiedUser.role || 'USER',
    industry: unifiedUser.industry,
    experience: unifiedUser.experience,
    companySize: unifiedUser.companySize,
    budget: unifiedUser.budget
  } : null

  if (!dashboardUser) {
    return <PageLoading message="Loading user data..." />
  }

  const isAdmin = dashboardUser.role === 'ADMIN' || dashboardUser.role === 'TEAM_MEMBER'

  return (
    <DashboardErrorBoundary>
      <ComprehensiveDashboardLayout 
        user={dashboardUser}
        isAdmin={isAdmin}
      />
    </DashboardErrorBoundary>
  )
}

export default function EnhancedDashboard() {
  return <DashboardWrapper />
}