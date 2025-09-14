"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedUserManagement } from "@/components/admin/EnhancedUserManagement"
import { NotificationHistory } from "@/components/admin/NotificationHistory"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"

interface ExpirationData {
  subscriptionId: string
  userId: string
  userEmail: string
  userName: string | null
  planId: string | null
  currentPeriodEnd: string
  daysRemaining: number
  isUrgent: boolean
  isCritical: boolean
}

interface ExpirationSummary {
  total: number
  critical: number
  urgent: number
}

interface AdminPermissions {
  canSendNotifications: boolean
  canViewHistory: boolean
  canManageUsers: boolean
}

export default function AdminNotificationsPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("expirations")
  const [expirations, setExpirations] = useState<ExpirationData[]>([])
  const [expirationSummary, setExpirationSummary] = useState<ExpirationSummary>({ total: 0, critical: 0, urgent: 0 })
  const [expirationsLoading, setExpirationsLoading] = useState(false)
  const [bulkNotificationLoading, setBulkNotificationLoading] = useState(false)
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canSendNotifications: false,
    canViewHistory: false,
    canManageUsers: false
  })
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAccess()
    setIsPageLoaded(true)
  }, [])

  const checkAccess = async () => {
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
        setPermissions(data.permissions)
        setHasAccess(true)
        
        // Set default tab based on permissions
        if (data.permissions.canSendNotifications) {
          setActiveTab("users")
        } else if (data.permissions.canViewHistory) {
          setActiveTab("history")
        } else {
          setActiveTab("expirations")
        }
      } else if (response.status === 403) {
        setHasAccess(false)
        setError('Insufficient permissions to access notifications')
      } else if (response.status === 503) {
        setError('Database connection failed. Please try again later.')
        setHasAccess(false)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setError(`API Error: ${errorData.error || 'Failed to check access'}`)
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setError(`Network Error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpirations = async (days = 30) => {
    setExpirationsLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/notifications/subscription-expiry?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExpirations(data.upcomingExpirations)
        setExpirationSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching expirations:', error)
    } finally {
      setExpirationsLoading(false)
    }
  }

  const sendBulkExpirationNotifications = async (testMode = true) => {
    setBulkNotificationLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/notifications/subscription-expiry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          daysToCheck: [30, 14, 7, 3, 1],
          testMode
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${testMode ? 'Test completed' : 'Notifications sent'}:\n\n` +
              `Subscriptions checked: ${result.summary.subscriptionsChecked}\n` +
              `Notifications sent: ${result.summary.notificationsSent}\n` +
              `Errors: ${result.summary.errors}`)
        
        if (!testMode) {
          // Refresh the expirations list
          fetchExpirations()
        }
      } else {
        const errorData = await response.json()
        alert('Error: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
      alert('Error sending notifications')
    } finally {
      setBulkNotificationLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'expirations') {
      fetchExpirations()
    }
  }, [activeTab])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <DynamicPageBackground variant="admin" opacity={0.15} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <DynamicPageBackground variant="admin" opacity={0.15} />
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-gray-400">
            {error || "You don't have permission to access the notification system."}
          </p>
          <p className="text-gray-500 text-sm mt-2">Required role: MODERATOR or higher</p>
          {error && (
            <button
              onClick={checkAccess}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DynamicPageBackground variant="admin" opacity={0.15} />
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div>
            <h1 className="text-4xl font-light mb-2">
              <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Notification Center
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Advanced user monitoring and email notifications</p>
          </div>
        </div>

        <div className={`transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full ${permissions.canSendNotifications ? 'grid-cols-3' : 'grid-cols-2'} bg-gray-900 border border-gray-700`}>
              {permissions.canSendNotifications && (
                <TabsTrigger value="users" className="data-[state=active]:bg-orange-500">
                  👥 User Management
                </TabsTrigger>
              )}
              <TabsTrigger value="expirations" className="data-[state=active]:bg-yellow-500">
                ⏰ Subscription Monitoring
              </TabsTrigger>
              {permissions.canViewHistory && (
                <TabsTrigger value="history" className="data-[state=active]:bg-blue-500">
                  📋 Notification History
                </TabsTrigger>
              )}
            </TabsList>

            {/* Enhanced User Management */}
            {permissions.canSendNotifications && (
              <TabsContent value="users">
                <EnhancedUserManagement />
              </TabsContent>
            )}

            {/* Subscription Expiration Monitoring */}
            <TabsContent value="expirations" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-400 text-lg">Critical (≤3 days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-400">{expirationSummary.critical}</div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-500/10 border-yellow-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-yellow-400 text-lg">Urgent (≤7 days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-400">{expirationSummary.urgent}</div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-400 text-lg">Total (≤30 days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-400">{expirationSummary.total}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Bulk Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Bulk Actions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Send expiration warnings to all users with subscriptions expiring in 30, 14, 7, 3, or 1 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => sendBulkExpirationNotifications(true)}
                      disabled={bulkNotificationLoading}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      {bulkNotificationLoading ? 'Running...' : '🧪 Test Run (Preview)'}
                    </Button>
                    <Button
                      onClick={() => sendBulkExpirationNotifications(false)}
                      disabled={bulkNotificationLoading}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {bulkNotificationLoading ? 'Sending...' : '📧 Send All Notifications'}
                    </Button>
                    <Button
                      onClick={() => fetchExpirations()}
                      disabled={expirationsLoading}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      {expirationsLoading ? 'Loading...' : '🔄 Refresh'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Subscriptions List */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Upcoming Expirations</CardTitle>
                  <CardDescription className="text-gray-400">
                    Subscriptions expiring in the next 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expirationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading expirations...</p>
                    </div>
                  ) : expirations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No upcoming expirations found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expirations.map((expiration) => (
                        <div 
                          key={expiration.subscriptionId}
                          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-medium text-white">
                                  {expiration.userName || expiration.userEmail}
                                </h3>
                                <Badge className={
                                  expiration.isCritical 
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                    : expiration.isUrgent
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                }>
                                  {expiration.daysRemaining} days remaining
                                </Badge>
                                <Badge variant="outline" className="text-gray-400">
                                  {expiration.planId || 'Unknown Plan'}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-400 mb-2">{expiration.userEmail}</p>
                              
                              <div className="text-sm text-gray-400">
                                Expires: {new Date(expiration.currentPeriodEnd).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Global Notification History */}
            {permissions.canViewHistory && (
              <TabsContent value="history">
                <NotificationHistory />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}