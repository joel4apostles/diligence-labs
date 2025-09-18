"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import ExpertApplications to avoid SSR issues
const ExpertApplications = dynamic(() => import('@/components/admin/ExpertApplications'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-400">Loading applications...</span>
    </div>
  )
})

// Lazy load background components
const DynamicPageBackground = dynamic(() => import("@/components/ui/dynamic-page-background").then(mod => ({ default: mod.DynamicPageBackground })), {
  ssr: false,
  loading: () => null
})

const PageStructureLines = dynamic(() => import("@/components/ui/page-structure").then(mod => ({ default: mod.PageStructureLines })), {
  ssr: false,
  loading: () => null
})

export default function ExpertApplicationsPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const checkAuth = async () => {
      try {
        setIsPageLoaded(true)
        
        // For development, bypass auth check and allow access
        setIsAuthorized(true)
        
        // Uncomment below for production auth check
        /*
        const token = localStorage.getItem('adminToken')
        if (!token) {
          setAuthError('No admin token found. Please login.')
          router.push('/admin/auth/login')
          return
        }
        setIsAuthorized(true)
        */
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthError('Authentication failed')
        // router.push('/admin/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{authError}</p>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Unauthorized access</p>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Admin Background */}
      <DynamicPageBackground variant="admin" opacity={0.25} />
      <PageStructureLines />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className={`flex justify-between items-center mb-8 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Logo size="lg" href={null} />
                <div className="w-px h-6 bg-gradient-to-b from-orange-400 to-red-400"></div>
                <div className="text-lg text-gray-400">Expert Applications</div>
              </div>
              <h1 className="text-3xl font-light">
                <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Application Management</span>
              </h1>
              <p className="text-gray-400 text-sm">Review and approve expert verification requests</p>
            </div>
          </div>
        </div>

        {/* Expert Applications Component */}
        <div className={`transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <ExpertApplications />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}