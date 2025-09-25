'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface DashboardMetrics {
  quickStats: {
    sessionsToday: number
    reportsGenerated: number
    upcomingMeetings: number
    systemHealth: number
    activeUsers: number
  }
  recentActivity: Array<{
    id: string
    type: 'session' | 'report' | 'user' | 'system'
    message: string
    time: string
    user?: string
    metadata?: any
  }>
  notifications: {
    unreadCount: number
    urgent: number
    recent: Array<{
      id: string
      title: string
      message: string
      type: string
      createdAt: Date
    }>
  }
  systemStatus: {
    apiResponseTime: number
    databaseConnections: number
    uptime: number
    errorRate: number
  }
}

interface UseRealtimeDashboardOptions {
  refreshInterval?: number // in milliseconds
  includeSystem?: boolean
  autoRefresh?: boolean
  onUpdate?: (metrics: DashboardMetrics) => void
  onError?: (error: Error) => void
}

export function useRealtimeDashboard(options: UseRealtimeDashboardOptions = {}) {
  const {
    refreshInterval = 30000, // 30 seconds default
    includeSystem = false,
    autoRefresh = true,
    onUpdate,
    onError
  } = options

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchMetrics = useCallback(async (since?: Date) => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      
      const params = new URLSearchParams()
      if (since) params.set('since', since.toISOString())
      if (includeSystem) params.set('includeSystem', 'true')

      const response = await fetch(`/api/dashboard/realtime-updates?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard metrics: ${response.status}`)
      }

      const data: DashboardMetrics = await response.json()
      
      setMetrics(data)
      setLastUpdate(new Date())
      setError(null)
      setIsConnected(true)
      
      onUpdate?.(data)
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled, ignore
      }
      
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      setIsConnected(false)
      onError?.(error)
      console.error('Dashboard metrics fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [includeSystem, onUpdate, onError])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Set up polling for real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        fetchMetrics(lastUpdate || new Date(Date.now() - refreshInterval))
      }, refreshInterval)
    }

    startPolling()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, refreshInterval, fetchMetrics, lastUpdate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true)
    return fetchMetrics()
  }, [fetchMetrics])

  // Send action to server (like marking notifications as read)
  const sendAction = useCallback(async (action: string, data?: any) => {
    try {
      const response = await fetch('/api/dashboard/realtime-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, data })
      })

      if (!response.ok) {
        throw new Error(`Failed to send action: ${response.status}`)
      }

      const result = await response.json()
      
      // Refresh metrics after successful action
      if (result.success) {
        fetchMetrics()
      }
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send action')
      console.error('Dashboard action error:', error)
      throw error
    }
  }, [fetchMetrics])

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true)
      if (autoRefresh) {
        fetchMetrics()
      }
    }

    const handleOffline = () => {
      setIsConnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [autoRefresh, fetchMetrics])

  // Page visibility handling to pause/resume updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        // Page is visible, resume polling
        if (autoRefresh && !intervalRef.current) {
          fetchMetrics()
          intervalRef.current = setInterval(() => {
            fetchMetrics(lastUpdate || new Date(Date.now() - refreshInterval))
          }, refreshInterval)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [autoRefresh, refreshInterval, fetchMetrics, lastUpdate])

  return {
    metrics,
    loading,
    error,
    lastUpdate,
    isConnected,
    refresh,
    sendAction
  }
}