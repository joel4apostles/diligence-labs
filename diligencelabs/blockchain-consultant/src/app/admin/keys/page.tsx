"use client"

import { AdminKeyManagement } from '@/components/admin/AdminKeyManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminInfo {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminKeysPage() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        if (!token) {
          router.push('/admin/auth/login')
          return
        }

        const response = await fetch('/api/admin/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          router.push('/admin/auth/login')
          return
        }

        const data = await response.json()
        setAdminInfo(data.admin)

        // Check if admin has SUPER_ADMIN role
        if (data.admin.role !== 'SUPER_ADMIN') {
          setAccessDenied(true)
        }
      } catch (error) {
        console.error('Access check failed:', error)
        router.push('/admin/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking access permissions...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full border-red-500/20 bg-red-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🚫</span>
              </div>
              <CardTitle className="text-red-400 text-xl">Access Denied</CardTitle>
              <CardDescription className="text-gray-300">
                Super Admin privileges are required to access the Admin Key Management system.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Current Role:</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                  {adminInfo?.role || 'Unknown'}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                <p>Contact your system administrator to request Super Admin access if needed.</p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Return to Dashboard
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Key Management</h1>
          <p className="text-gray-400">
            Generate and manage dynamic registration keys for admin account creation.
          </p>
        </div>

        <Card className="mb-8 border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-blue-400">🔐 Dynamic Admin Keys</CardTitle>
            <CardDescription>
              This system provides enhanced security with:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Automatic Expiration:</strong> Keys expire after a set time period</li>
              <li>• <strong>Usage Limits:</strong> Limit how many times a key can be used</li>
              <li>• <strong>Key Rotation:</strong> Generate new keys and deactivate old ones instantly</li>
              <li>• <strong>Usage Tracking:</strong> Monitor when and how often keys are used</li>
              <li>• <strong>Fallback Support:</strong> Environment variable fallback for reliability</li>
            </ul>
          </CardContent>
        </Card>

        <AdminKeyManagement />
      </div>
    </div>
  )
}