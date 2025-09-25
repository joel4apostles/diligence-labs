'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellRing, 
  X, 
  Clock, 
  TrendingUp, 
  Users, 
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react'
import { SmartNotificationEngine } from '@/lib/ai-recommendations'
import type { UserProfile } from '@/lib/ai-recommendations'
import Link from 'next/link'

interface SmartNotification {
  id: string
  title: string
  message: string
  type: 'recommendation' | 'alert' | 'update' | 'achievement'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  timestamp: Date
  read?: boolean
  category?: string
}

interface SmartNotificationsProps {
  userProfile: UserProfile
  className?: string
  showBadge?: boolean
}

export default function SmartNotifications({ 
  userProfile, 
  className = '',
  showBadge = true 
}: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNotifications()
    
    // Set up periodic refresh for smart notifications
    const interval = setInterval(loadNotifications, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [userProfile])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      // Load AI-generated notifications
      const aiNotifications = await SmartNotificationEngine.generateSmartNotifications(userProfile)
      
      // Add some mock system notifications for demonstration
      const systemNotifications = generateSystemNotifications()
      
      const allNotifications = [...aiNotifications, ...systemNotifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setNotifications(allNotifications)
    } catch (error) {
      console.error('Failed to load smart notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSystemNotifications = (): SmartNotification[] => {
    const now = new Date()
    
    return [
      {
        id: `system-${Date.now()}-1`,
        title: 'Market Update',
        message: 'Bitcoin ETF approvals are driving institutional blockchain adoption. Consider scheduling a strategy session.',
        type: 'update',
        priority: 'medium',
        actionUrl: '/dashboard/book-consultation',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: 'market'
      },
      {
        id: `system-${Date.now()}-2`,
        title: 'Consultation Ready',
        message: 'Your next consultation session is scheduled for tomorrow at 2:00 PM.',
        type: 'alert',
        priority: 'high',
        actionUrl: '/dashboard/sessions',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        category: 'schedule'
      },
      {
        id: `system-${Date.now()}-3`,
        title: 'Achievement Unlocked',
        message: 'You\'ve completed 5 consultations! Unlock advanced blockchain strategies.',
        type: 'achievement',
        priority: 'medium',
        actionUrl: '/dashboard/achievements',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        category: 'achievement'
      }
    ]
  }

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'recommendation':
        return priority === 'urgent' ? BellRing : Lightbulb
      case 'alert':
        return AlertCircle
      case 'update':
        return TrendingUp
      case 'achievement':
        return CheckCircle
      default:
        return Info
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'from-red-500 to-red-600'
    
    switch (type) {
      case 'recommendation':
        return 'from-blue-500 to-blue-600'
      case 'alert':
        return 'from-yellow-500 to-yellow-600'
      case 'update':
        return 'from-green-500 to-green-600'
      case 'achievement':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'low':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const hasUrgentNotifications = notifications.some(n => n.priority === 'urgent' && !n.read)

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-800 transition-colors"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {hasUrgentNotifications ? (
            <BellRing className="w-5 h-5 text-red-400" />
          ) : (
            <Bell className="w-5 h-5 text-gray-300" />
          )}
        </motion.div>
        
        {showBadge && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              hasUrgentNotifications ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50"
            style={{ maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Smart Notifications</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-full mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No notifications yet</p>
                  <p className="text-sm text-gray-500">We'll notify you of important updates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type, notification.priority)
                    const isUnread = !notification.read
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          isUnread ? 'bg-blue-500/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getNotificationColor(notification.type, notification.priority)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`font-medium ${isUnread ? 'text-white' : 'text-gray-300'} truncate`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={`text-xs px-1.5 py-0.5 ${getPriorityBadgeColor(notification.priority)}`}>
                                  {notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    dismissNotification(notification.id)
                                  }}
                                  className="p-1 hover:bg-gray-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className={`text-sm ${isUnread ? 'text-gray-300' : 'text-gray-400'} mb-2`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notification.timestamp)}
                              </div>
                              
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-blue-400 hover:text-blue-300 p-1"
                                  >
                                    Take Action →
                                  </Button>
                                </Link>
                              )}
                            </div>
                            
                            {isUnread && (
                              <div className="absolute left-1 top-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700/50 bg-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>AI-powered insights</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadNotifications}
                  className="text-xs text-blue-400 hover:text-blue-300 p-1"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom scrollbar styles (add to global CSS)
const styles = `
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}
`

export { styles as SmartNotificationStyles }