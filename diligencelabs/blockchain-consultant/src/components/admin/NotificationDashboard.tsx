"use client"

import { useState, useEffect, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProminentBorder } from "@/components/ui/border-effects"
import { NotificationModal } from "./NotificationModal"

interface NotificationSummary {
  recentNotifications: number
  failedNotifications: number
  criticalExpirations: number
  urgentExpirations: number
  suspiciousUsers: number
  expiredSubscriptions: number
}

interface NotificationPermissions {
  canSendNotifications: boolean
  canViewHistory: boolean
  canManageUsers: boolean
}

interface NotificationDashboardProps {
  isPageLoaded: boolean
  summary?: NotificationSummary
  permissions?: NotificationPermissions
  loading?: boolean
}

const NotificationDashboard = memo(function NotificationDashboard({ 
  isPageLoaded, 
  summary: propSummary, 
  permissions: propPermissions, 
  loading: propLoading = false 
}: NotificationDashboardProps) {
  const [summary, setSummary] = useState<NotificationSummary>({
    recentNotifications: 0,
    failedNotifications: 0,
    criticalExpirations: 0,
    urgentExpirations: 0,
    suspiciousUsers: 0,
    expiredSubscriptions: 0
  })
  const [permissions, setPermissions] = useState<NotificationPermissions>({
    canSendNotifications: false,
    canViewHistory: false,
    canManageUsers: false
  })
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotificationSummary = async () => {
    try {
      setError(null)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('No admin token found')
        setHasAccess(false)
        return
      }

      const response = await fetch('/api/admin/notifications/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setPermissions(data.permissions)
        setHasAccess(true)
        console.log('Successfully loaded notification summary')
      } else if (response.status === 403) {
        // User doesn't have permission to access notifications
        setHasAccess(false)
        setError('Insufficient permissions to access notifications')
      } else if (response.status === 503) {
        setError('Database connection failed. Please try again later.')
        setHasAccess(false)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setError(`API Error: ${errorData.error || 'Failed to fetch notification data'}`)
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error fetching notification summary:', error)
      setError(`Network Error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // If data is passed as props, use it instead of making API call
    if (propSummary && propPermissions) {
      setSummary(propSummary)
      setPermissions(propPermissions)
      setHasAccess(true)
      setLoading(propLoading)
      setError(null)
      console.log("Using notification data from props - no API call needed")
    } else {
      // Fallback to API call if props not available
      fetchNotificationSummary()
    }
  }, [propSummary, propPermissions, propLoading])

  if (loading) {
    return (
      <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="mb-8">
          <h2 className="text-2xl font-light text-white mb-4">Notification Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-xl h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-white">Notification Center</h2>
            <Button 
              onClick={fetchNotificationSummary}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-red-900/60 to-red-800/30 backdrop-blur-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-red-400 text-2xl">⚠️</div>
                  <div>
                    <h3 className="text-lg font-medium text-red-200">Error Loading Notifications</h3>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
                <p className="text-red-200 text-sm">
                  Please check your internet connection and admin permissions, then try again.
                </p>
              </CardContent>
            </Card>
          </ProminentBorder>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null // Don't show anything if user doesn't have access
  }

  return (
    <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light text-white">Notification Center</h2>
          {permissions.canViewHistory && (
            <NotificationModal
              title="Notification History"
              description="View all sent notifications and their delivery status"
              type="history"
              trigger={
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  📋 View History
                </Button>
              }
            />
          )}
        </div>

        {/* Notification Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Recent Notifications */}
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/30 backdrop-blur-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-200">Recent (24h)</CardTitle>
                <div className="text-blue-400">📧</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.recentNotifications}</div>
                <p className="text-xs text-blue-300">Notifications sent</p>
              </CardContent>
            </Card>
          </ProminentBorder>

          {/* Critical Expirations */}
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-red-900/60 to-red-800/30 backdrop-blur-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-200">Critical Expirations</CardTitle>
                <div className="text-red-400">🚨</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.criticalExpirations}</div>
                <p className="text-xs text-red-300">≤ 3 days remaining</p>
              </CardContent>
            </Card>
          </ProminentBorder>

          {/* Suspicious Users */}
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-yellow-900/60 to-yellow-800/30 backdrop-blur-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-200">Security Alerts</CardTitle>
                <div className="text-yellow-400">🛡️</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.suspiciousUsers}</div>
                <p className="text-xs text-yellow-300">Users need attention</p>
              </CardContent>
            </Card>
          </ProminentBorder>

          {/* Failed Notifications */}
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Failed Notifications</CardTitle>
                <div className="text-gray-400">❌</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.failedNotifications}</div>
                <p className="text-xs text-gray-300">Last 7 days</p>
              </CardContent>
            </Card>
          </ProminentBorder>
        </div>

        {/* Action Cards */}
        {permissions.canSendNotifications && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
              <Card className="bg-gradient-to-br from-orange-900/60 to-red-800/30 backdrop-blur-xl border-0">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    📧 User Notifications
                  </CardTitle>
                  <CardDescription className="text-orange-200">
                    Send email notifications to users about their account status, security alerts, or subscription changes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Subscription Status
                    </Badge>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Security Alerts
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Expiration Warnings
                    </Badge>
                  </div>
                  <NotificationModal
                    title="User Notifications"
                    description="Send email notifications to users about their account status, security alerts, or subscription changes"
                    type="users"
                    trigger={
                      <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 hover:scale-105">
                        Manage User Notifications
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </ProminentBorder>

            <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
              <Card className="bg-gradient-to-br from-yellow-900/60 to-orange-800/30 backdrop-blur-xl border-0">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    ⏰ Subscription Monitoring
                  </CardTitle>
                  <CardDescription className="text-yellow-200">
                    Monitor and send automated expiration warnings for upcoming subscription renewals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-yellow-400 font-medium">{summary.urgentExpirations}</div>
                      <div className="text-yellow-200">≤ 7 days</div>
                    </div>
                    <div>
                      <div className="text-red-400 font-medium">{summary.expiredSubscriptions}</div>
                      <div className="text-red-200">Already expired</div>
                    </div>
                  </div>
                  <NotificationModal
                    title="Subscription Monitor"
                    description="Monitor and send automated expiration warnings for upcoming subscription renewals"
                    type="expirations"
                    trigger={
                      <Button className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white transition-all duration-300 hover:scale-105">
                        Subscription Monitor
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </ProminentBorder>
          </div>
        )}

        {/* View Only Cards for Moderators */}
        {!permissions.canSendNotifications && permissions.canViewHistory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProminentBorder className="rounded-2xl overflow-hidden" animated={false}>
              <Card className="bg-gradient-to-br from-blue-900/60 to-purple-800/30 backdrop-blur-xl border-0">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    📋 Notification History
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    View notification history and delivery status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <NotificationModal
                    title="Notification History"
                    description="View notification history and delivery status"
                    type="history"
                    trigger={
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105">
                        View Notification History
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </ProminentBorder>
          </div>
        )}
      </div>
    </div>
  )
})

export { NotificationDashboard }