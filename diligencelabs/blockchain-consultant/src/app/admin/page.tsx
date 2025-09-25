"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading } from "@/components/ui/loading-states"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken')
    
    if (token) {
      // If logged in, redirect to dashboard
      router.push('/admin/dashboard')
    } else {
      // If not logged in, redirect to login
      router.push('/admin/auth/login')
    }
  }, [router])

  return (
    <ErrorBoundary>
      <PageLoading message="Redirecting to admin panel..." showLogo={true} />
    </ErrorBoundary>
  )
}