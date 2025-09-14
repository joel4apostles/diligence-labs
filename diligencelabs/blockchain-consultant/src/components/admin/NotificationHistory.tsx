"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface NotificationLog {
  id: string
  notificationType: string
  emailSent: boolean
  details: any
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  admin: {
    id: string
    email: string
    name: string
  }
}

interface NotificationHistoryProps {
  userId?: string
  limit?: number
}

export function NotificationHistory({ userId, limit = 10 }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchNotifications = async (pageNum = 1) => {
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString()
      })
      
      if (userId) {
        params.append('userId', userId)
      }

      const response = await fetch(`/api/admin/notifications/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (pageNum === 1) {
          setNotifications(data.notifications)
        } else {
          setNotifications(prev => [...prev, ...data.notifications])
        }
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Error fetching notification history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'subscription_status':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'malicious_activity':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'subscription_expiration':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription_status':
        return 'Subscription Status'
      case 'malicious_activity':
        return 'Security Alert'
      case 'subscription_expiration':
        return 'Expiration Warning'
      default:
        return type.replace('_', ' ').toUpperCase()
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage)
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading notification history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Notification History</CardTitle>
        <CardDescription className="text-gray-400">
          {userId ? 'Recent notifications for this user' : 'All recent notifications'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getNotificationTypeColor(notification.notificationType)}>
                      {getNotificationTypeLabel(notification.notificationType)}
                    </Badge>
                    <Badge variant={notification.emailSent ? "default" : "destructive"}>
                      {notification.emailSent ? '✓ Sent' : '✗ Failed'}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Recipient:</span>
                    <div className="text-white font-medium">{notification.user.name || notification.user.email}</div>
                    <div className="text-gray-400">{notification.user.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Sent by:</span>
                    <div className="text-white font-medium">{notification.admin.name}</div>
                    <div className="text-gray-400">{notification.admin.email}</div>
                  </div>
                </div>

                {notification.details && (
                  <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-600">
                    <span className="text-gray-400 text-sm">Details:</span>
                    <pre className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">
                      {JSON.stringify(notification.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  onClick={loadMore}
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}