'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealtimeStatusIndicatorProps {
  isConnected: boolean
  lastUpdate: Date | null
  loading: boolean
  error: Error | null
  onRefresh?: () => void
  systemHealth?: number
  className?: string
}

export function RealtimeStatusIndicator({
  isConnected,
  lastUpdate,
  loading,
  error,
  onRefresh,
  systemHealth = 100,
  className
}: RealtimeStatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [timeAgo, setTimeAgo] = useState<string>('')

  // Update time ago every minute
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) {
        setTimeAgo('Never')
        return
      }

      const now = new Date()
      const diff = now.getTime() - lastUpdate.getTime()
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`)
      } else if (seconds > 30) {
        setTimeAgo(`${seconds}s ago`)
      } else {
        setTimeAgo('Just now')
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [lastUpdate])

  const getConnectionStatus = () => {
    if (loading) {
      return {
        status: 'syncing',
        color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
        icon: RefreshCw,
        label: 'Syncing...'
      }
    }

    if (error) {
      return {
        status: 'error',
        color: 'text-red-400 bg-red-500/20 border-red-500/30',
        icon: AlertTriangle,
        label: 'Connection Error'
      }
    }

    if (!isConnected) {
      return {
        status: 'offline',
        color: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
        icon: WifiOff,
        label: 'Offline'
      }
    }

    if (systemHealth >= 95) {
      return {
        status: 'excellent',
        color: 'text-green-400 bg-green-500/20 border-green-500/30',
        icon: CheckCircle2,
        label: 'Excellent'
      }
    }

    if (systemHealth >= 85) {
      return {
        status: 'good',
        color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
        icon: Activity,
        label: 'Good'
      }
    }

    return {
      status: 'warning',
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      icon: AlertTriangle,
      label: 'Degraded'
    }
  }

  const connectionStatus = getConnectionStatus()
  const StatusIcon = connectionStatus.icon

  return (
    <div className={cn("relative", className)}>
      {/* Main Status Indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={loading ? { rotate: 360 } : { rotate: 0 }}
          transition={loading ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0 }}
          className="relative"
        >
          <div className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300",
            connectionStatus.color
          )}
          onClick={() => setShowDetails(!showDetails)}
          >
            <StatusIcon className="w-4 h-4" />
          </div>
          
          {/* Pulse animation for active connection */}
          {isConnected && !loading && !error && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-green-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="hidden sm:block">
          <Badge variant="outline" className={cn("text-xs", connectionStatus.color)}>
            {connectionStatus.label}
          </Badge>
        </div>

        {/* Quick refresh button */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="p-1 h-6 w-6 text-gray-400 hover:text-white"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Detailed Status Popup */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 z-50 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-xl p-4"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">System Status</h4>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Connection</span>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={cn(
                    "text-xs",
                    isConnected ? "text-green-400" : "text-red-400"
                  )}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* System Health */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">System Health</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        systemHealth >= 95 ? "bg-green-400" :
                        systemHealth >= 85 ? "bg-blue-400" :
                        systemHealth >= 75 ? "bg-yellow-400" : "bg-red-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${systemHealth}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 w-8">{systemHealth}%</span>
                </div>
              </div>

              {/* Last Update */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Last Update</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-300">{timeAgo}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-red-400">Connection Error</div>
                      <div className="text-xs text-red-300 mt-1">{error.message}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onRefresh()
                      setShowDetails(false)
                    }}
                    disabled={loading}
                    className="flex-1 text-xs border-gray-600"
                  >
                    <RefreshCw className={cn("w-3 h-3 mr-2", loading && "animate-spin")} />
                    Refresh
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}