'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  Calendar,
  FileText,
  CreditCard,
  Award,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
  Zap
} from 'lucide-react'
import { 
  GlassMorphismCard,
  theme,
  animations
} from '@/components/ui/consistent-theme'
import { cn } from '@/lib/utils'

interface DashboardNotification {
  id: string
  type: 'session' | 'report' | 'subscription' | 'system' | 'achievement'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  actionUrl?: string
  actionText?: string
  createdAt: Date
  metadata?: Record<string, any>
}

interface NotificationResponse {
  notifications: DashboardNotification[]
  unreadCount: number
  totalCount: number
}

interface RealtimeNotificationsProps {
  userId: string
  className?: string
}

export function RealtimeNotifications({ userId, className }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/dashboard/notifications?limit=10')
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      
      const data: NotificationResponse = await response.json()
      
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds,
          action: 'markAsRead'
        })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'session':
        return <Calendar className="w-4 h-4" />
      case 'report':
        return <FileText className="w-4 h-4" />
      case 'subscription':
        return <CreditCard className="w-4 h-4" />
      case 'achievement':
        return <Award className="w-4 h-4" />
      case 'system':
        return priority === 'urgent' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'text-blue-400'
      case 'report':
        return 'text-purple-400'
      case 'subscription':
        return 'text-orange-400'
      case 'achievement':
        return 'text-green-400'
      case 'system':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 z-50"
          >
            <GlassMorphismCard variant="neutral" className="border border-gray-700 shadow-xl">
              <Card className="bg-transparent border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notifications.filter(n => !n.isRead).map(n => n.id))}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <CardDescription className="text-gray-400">
                      You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                        <span>Loading notifications...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-400">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{error}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchNotifications}
                        className="mt-2 text-blue-400 hover:text-blue-300"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs mt-1">We'll notify you when something important happens</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-1 p-2">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "p-3 rounded-lg border transition-all duration-300 hover:bg-gray-800/30 cursor-pointer",
                              notification.isRead 
                                ? "bg-gray-800/20 border-gray-700/50 opacity-70" 
                                : "bg-gray-800/40 border-gray-600/50"
                            )}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead([notification.id])
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                getPriorityColor(notification.priority)
                              )}>
                                {getNotificationIcon(notification.type, notification.priority)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-medium text-white truncate">
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                    <Badge variant="outline" className={cn("text-xs", getTypeColor(notification.type))}>
                                      {notification.type}
                                    </Badge>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTimeAgo(notification.createdAt)}
                                  </div>
                                  
                                  {notification.actionUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Handle navigation to action URL
                                        window.open(notification.actionUrl, '_self')
                                      }}
                                    >
                                      {notification.actionText}
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-700 bg-gray-800/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-400 hover:text-blue-300"
                        onClick={() => {
                          setIsOpen(false)
                          // Navigate to full notifications page
                        }}
                      >
                        View all notifications
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </GlassMorphismCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}