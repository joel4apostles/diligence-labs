"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading } from "@/components/ui/loading-states"
import { 
  PageWrapper, 
  GlassMorphismCard, 
  FloatingOrb,
  theme,
  animations
} from "@/components/ui/consistent-theme"
import { motion } from "framer-motion"

interface AdminData {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [adminData, setAdminData] = useState<AdminData | null>(null)

  // Skip authentication for auth pages
  const isAuthPage = pathname?.includes('/admin/auth/')

  useEffect(() => {
    if (isAuthPage) {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      router.push('/admin/auth/login')
      return
    }

    // Verify token with backend
    verifyAdminToken(token)
  }, [isAuthPage, router])

  const verifyAdminToken = async (token: string) => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdminData(data.admin)
        setIsLoading(false)
      } else {
        localStorage.removeItem('adminToken')
        router.push('/admin/auth/login')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('adminToken')
      router.push('/admin/auth/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/auth/login')
  }

  if (isAuthPage) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    )
  }

  if (isLoading) {
    return <PageLoading message="Loading admin dashboard..." showLogo={true} />
  }

  if (!adminData) {
    return null
  }

  return (
    <ErrorBoundary>
      <PageWrapper backgroundVariant="grid" showOrbs={false}>
        {/* Admin-specific floating orbs */}
        <FloatingOrb color="orange" position={{ top: '25%', right: '25%' }} delay={0} />
        <FloatingOrb color="orange" position={{ bottom: '25%', left: '25%' }} delay={2} />

        {/* Admin Navigation Header */}
        <motion.div 
          {...animations.slideDown}
          transition={{ duration: 0.6 }}
          className="border-b border-gray-800/50 backdrop-blur-xl bg-black/20"
        >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Diligence Labs Admin
                </span>
              </Link>
              
              {/* Admin Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/admin/dashboard"
                  className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-800/50"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/assignments"
                  className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-800/50"
                >
                  Task Assignments
                </Link>
                <Link 
                  href="/admin/team"
                  className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-800/50"
                >
                  Team Management
                </Link>
                <Link 
                  href="/admin/users"
                  className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-800/50"
                >
                  User Management
                </Link>
                <Link 
                  href="/admin/notifications"
                  className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-800/50"
                >
                  Notifications
                </Link>
                <Link 
                  href="/admin/reports"
                  className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-gray-800/50"
                >
                  Reports & Analytics
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                <span className="text-orange-400 font-medium">Admin:</span> {adminData.name || adminData.email}
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-red-600 text-red-300 hover:bg-red-900/20 hover:border-red-500 transition-all duration-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
        </motion.div>

        {/* Admin Content */}
        <div className="relative z-10">
          {children}
        </div>
      </PageWrapper>
    </ErrorBoundary>
  )
}