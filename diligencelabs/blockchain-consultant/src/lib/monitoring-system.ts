import { logger, LogCategory } from './advanced-logger'
import { cache } from './redis-cache'
import { getDatabaseMetrics, getDatabase } from './database'
import { jobProcessor } from './background-jobs'

interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  message?: string
  duration: number
  timestamp: Date
  details?: any
}

interface SystemMetrics {
  timestamp: Date
  system: {
    uptime: number
    memory: NodeJS.MemoryUsage
    cpu: any
  }
  database: {
    health: any
    connections: any
    queryTime: number
  }
  cache: {
    status: string
    stats: any
  }
  jobs: {
    stats: any
  }
  api: {
    totalRequests: number
    errorRate: number
    averageResponseTime: number
  }
}

interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  message: string
  details: any
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

enum AlertType {
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  HIGH_ERROR_RATE = 'HIGH_ERROR_RATE',
  SLOW_RESPONSE_TIME = 'SLOW_RESPONSE_TIME',
  HIGH_MEMORY_USAGE = 'HIGH_MEMORY_USAGE',
  CACHE_FAILURE = 'CACHE_FAILURE',
  JOB_QUEUE_BACKLOG = 'JOB_QUEUE_BACKLOG',
  SECURITY_THREAT = 'SECURITY_THREAT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

class MonitoringSystem {
  private healthChecks: Map<string, HealthCheck> = new Map()
  private metrics: SystemMetrics[] = []
  private alerts: Alert[] = []
  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null
  private maxMetricsHistory = 1000
  private apiMetrics = {
    totalRequests: 0,
    totalErrors: 0,
    responseTimes: [] as number[],
    lastReset: Date.now()
  }

  private thresholds = {
    database: {
      maxConnectionTime: 1000, // ms
      maxQueryTime: 2000 // ms
    },
    memory: {
      maxUsagePercent: 85
    },
    api: {
      maxErrorRate: 0.05, // 5%
      maxResponseTime: 2000 // ms
    },
    jobs: {
      maxQueueSize: 100,
      maxProcessingTime: 300000 // 5 minutes
    }
  }

  constructor() {
    this.startMonitoring()
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    
    // Run health checks every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.runHealthChecks()
        await this.collectMetrics()
        await this.checkAlertConditions()
      } catch (error) {
        await logger.error(LogCategory.SYSTEM, 'Monitoring cycle failed', error)
      }
    }, 30000)

    logger.info(LogCategory.SYSTEM, 'Monitoring system started')
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    logger.info(LogCategory.SYSTEM, 'Monitoring system stopped')
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<Map<string, HealthCheck>> {
    const checks = [
      this.checkDatabase(),
      this.checkCache(),
      this.checkJobQueue(),
      this.checkMemory(),
      this.checkDiskSpace()
    ]

    await Promise.allSettled(checks)
    return this.healthChecks
  }

  /**
   * Database health check
   */
  private async checkDatabase(): Promise<void> {
    const start = Date.now()
    
    try {
      const db = await getDatabase()
      await db.$queryRaw`SELECT 1`
      
      const duration = Date.now() - start
      const status = duration > this.thresholds.database.maxConnectionTime ? 'degraded' : 'healthy'
      
      this.healthChecks.set('database', {
        name: 'Database',
        status,
        message: status === 'healthy' ? 'Database connection healthy' : 'Slow database response',
        duration,
        timestamp: new Date(),
        details: { connectionTime: duration }
      })
    } catch (error) {
      this.healthChecks.set('database', {
        name: 'Database',
        status: 'unhealthy',
        message: 'Database connection failed',
        duration: Date.now() - start,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  /**
   * Cache health check
   */
  private async checkCache(): Promise<void> {
    const start = Date.now()
    
    try {
      const testKey = 'health_check_test'
      const testValue = 'ok'
      
      await cache.set(testKey, testValue, { ttl: 10 })
      const retrieved = await cache.get(testKey)
      await cache.del(testKey)
      
      const duration = Date.now() - start
      const status = retrieved === testValue ? 'healthy' : 'degraded'
      
      this.healthChecks.set('cache', {
        name: 'Cache',
        status,
        message: status === 'healthy' ? 'Cache operational' : 'Cache issues detected',
        duration,
        timestamp: new Date(),
        details: { cacheResponseTime: duration }
      })
    } catch (error) {
      this.healthChecks.set('cache', {
        name: 'Cache',
        status: 'unhealthy',
        message: 'Cache connection failed',
        duration: Date.now() - start,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  /**
   * Job queue health check
   */
  private async checkJobQueue(): Promise<void> {
    const start = Date.now()
    
    try {
      const stats = jobProcessor.getStats()
      const duration = Date.now() - start
      
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
      let message = 'Job queue operational'
      
      if (stats.totalJobs > this.thresholds.jobs.maxQueueSize) {
        status = 'degraded'
        message = 'High job queue backlog'
      }
      
      if (stats.failedJobs > 0) {
        status = 'degraded'
        message = 'Some jobs have failed'
      }

      this.healthChecks.set('jobs', {
        name: 'Job Queue',
        status,
        message,
        duration,
        timestamp: new Date(),
        details: stats
      })
    } catch (error) {
      this.healthChecks.set('jobs', {
        name: 'Job Queue',
        status: 'unhealthy',
        message: 'Job queue check failed',
        duration: Date.now() - start,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  /**
   * Memory health check
   */
  private async checkMemory(): Promise<void> {
    const start = Date.now()
    
    try {
      const memUsage = process.memoryUsage()
      const duration = Date.now() - start
      
      // Calculate memory usage percentage (rough estimation)
      const totalMemory = memUsage.heapTotal + memUsage.external + memUsage.arrayBuffers
      const usedMemory = memUsage.heapUsed
      const usagePercent = (usedMemory / totalMemory) * 100
      
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
      let message = 'Memory usage normal'
      
      if (usagePercent > this.thresholds.memory.maxUsagePercent) {
        status = 'degraded'
        message = 'High memory usage'
      }

      this.healthChecks.set('memory', {
        name: 'Memory',
        status,
        message,
        duration,
        timestamp: new Date(),
        details: {
          ...memUsage,
          usagePercent: Math.round(usagePercent)
        }
      })
    } catch (error) {
      this.healthChecks.set('memory', {
        name: 'Memory',
        status: 'unhealthy',
        message: 'Memory check failed',
        duration: Date.now() - start,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  /**
   * Disk space health check
   */
  private async checkDiskSpace(): Promise<void> {
    const start = Date.now()
    
    try {
      // For Node.js applications, we'll check available memory as a proxy
      // In production, you'd want to check actual disk space
      const duration = Date.now() - start
      
      this.healthChecks.set('disk', {
        name: 'Disk Space',
        status: 'healthy',
        message: 'Disk space check not implemented',
        duration,
        timestamp: new Date(),
        details: { note: 'Implement actual disk space check for production' }
      })
    } catch (error) {
      this.healthChecks.set('disk', {
        name: 'Disk Space',
        status: 'unhealthy',
        message: 'Disk space check failed',
        duration: Date.now() - start,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const [dbMetrics, cacheStats, jobStats] = await Promise.all([
        getDatabaseMetrics(),
        cache.getStats(),
        jobProcessor.getStats()
      ])

      const metrics: SystemMetrics = {
        timestamp: new Date(),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        },
        database: {
          health: dbMetrics.health,
          connections: dbMetrics.connections,
          queryTime: dbMetrics.health.latency || 0
        },
        cache: {
          status: cacheStats.redisAvailable ? 'connected' : 'fallback',
          stats: cacheStats
        },
        jobs: {
          stats: jobStats
        },
        api: {
          totalRequests: this.apiMetrics.totalRequests,
          errorRate: this.apiMetrics.totalRequests > 0 ? 
            this.apiMetrics.totalErrors / this.apiMetrics.totalRequests : 0,
          averageResponseTime: this.apiMetrics.responseTimes.length > 0 ?
            this.apiMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.apiMetrics.responseTimes.length : 0
        }
      }

      this.metrics.push(metrics)
      
      // Keep only recent metrics
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory)
      }

      // Store metrics in cache for external access
      await cache.set('system:metrics:latest', metrics, { ttl: 60 })
      
    } catch (error) {
      await logger.error(LogCategory.SYSTEM, 'Failed to collect metrics', error)
    }
  }

  /**
   * Check for alert conditions
   */
  private async checkAlertConditions(): Promise<void> {
    const now = new Date()
    
    // Check database alerts
    const dbCheck = this.healthChecks.get('database')
    if (dbCheck?.status === 'unhealthy') {
      await this.createAlert(AlertType.DATABASE_CONNECTION, AlertSeverity.CRITICAL, 
        'Database connection failed', dbCheck.details)
    }

    // Check API error rate
    const errorRate = this.apiMetrics.totalRequests > 0 ? 
      this.apiMetrics.totalErrors / this.apiMetrics.totalRequests : 0
    
    if (errorRate > this.thresholds.api.maxErrorRate) {
      await this.createAlert(AlertType.HIGH_ERROR_RATE, AlertSeverity.HIGH, 
        `High API error rate: ${(errorRate * 100).toFixed(2)}%`, { errorRate, totalRequests: this.apiMetrics.totalRequests })
    }

    // Check response time
    const avgResponseTime = this.apiMetrics.responseTimes.length > 0 ?
      this.apiMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.apiMetrics.responseTimes.length : 0
    
    if (avgResponseTime > this.thresholds.api.maxResponseTime) {
      await this.createAlert(AlertType.SLOW_RESPONSE_TIME, AlertSeverity.MEDIUM, 
        `Slow API response time: ${avgResponseTime.toFixed(0)}ms`, { averageResponseTime: avgResponseTime })
    }

    // Check memory usage
    const memoryCheck = this.healthChecks.get('memory')
    if (memoryCheck?.details?.usagePercent > this.thresholds.memory.maxUsagePercent) {
      await this.createAlert(AlertType.HIGH_MEMORY_USAGE, AlertSeverity.HIGH, 
        `High memory usage: ${memoryCheck.details.usagePercent}%`, memoryCheck.details)
    }

    // Check job queue
    const jobStats = jobProcessor.getStats()
    if (jobStats.totalJobs > this.thresholds.jobs.maxQueueSize) {
      await this.createAlert(AlertType.JOB_QUEUE_BACKLOG, AlertSeverity.MEDIUM, 
        `Large job queue backlog: ${jobStats.totalJobs} jobs`, jobStats)
    }

    // Reset API metrics hourly
    const hourAgo = Date.now() - 60 * 60 * 1000
    if (this.apiMetrics.lastReset < hourAgo) {
      this.resetApiMetrics()
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(type: AlertType, severity: AlertSeverity, message: string, details: any): Promise<void> {
    // Check if we already have an unresolved alert of this type
    const existingAlert = this.alerts.find(alert => 
      alert.type === type && !alert.resolved
    )

    if (existingAlert) {
      // Update existing alert details
      existingAlert.details = details
      existingAlert.timestamp = new Date()
      return
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      details,
      timestamp: new Date(),
      resolved: false
    }

    this.alerts.push(alert)

    // Log the alert
    await logger.error(LogCategory.SYSTEM, `ALERT: ${message}`, undefined, {
      alertId: alert.id,
      type,
      severity,
      details
    })

    // Store alert in cache
    await cache.set(`alert:${alert.id}`, alert, { ttl: 86400 }) // 24 hours

    // In production, you would send notifications here (email, Slack, PagerDuty, etc.)
    if (severity === AlertSeverity.CRITICAL) {
      await this.sendCriticalAlert(alert)
    }
  }

  /**
   * Send critical alert notification
   */
  private async sendCriticalAlert(alert: Alert): Promise<void> {
    // This would integrate with your notification system
    await logger.error(LogCategory.SYSTEM, `CRITICAL ALERT: ${alert.message}`, undefined, {
      alertId: alert.id,
      details: alert.details
    })

    // Example: Send to Slack, PagerDuty, email, etc.
    // await notificationService.sendCriticalAlert(alert)
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = new Date()

    await logger.info(LogCategory.SYSTEM, `Alert resolved: ${alert.message}`, {
      alertId,
      resolvedAt: alert.resolvedAt
    })

    return true
  }

  /**
   * Record API request metrics
   */
  recordApiRequest(responseTime: number, isError: boolean = false): void {
    this.apiMetrics.totalRequests++
    if (isError) {
      this.apiMetrics.totalErrors++
    }
    
    this.apiMetrics.responseTimes.push(responseTime)
    
    // Keep only recent response times (last 1000 requests)
    if (this.apiMetrics.responseTimes.length > 1000) {
      this.apiMetrics.responseTimes = this.apiMetrics.responseTimes.slice(-1000)
    }
  }

  /**
   * Reset API metrics
   */
  private resetApiMetrics(): void {
    this.apiMetrics = {
      totalRequests: 0,
      totalErrors: 0,
      responseTimes: [],
      lastReset: Date.now()
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    status: 'healthy' | 'unhealthy' | 'degraded'
    checks: HealthCheck[]
    alerts: Alert[]
    uptime: number
    lastCheck: Date
  } {
    const checks = Array.from(this.healthChecks.values())
    const unresolvedAlerts = this.alerts.filter(alert => !alert.resolved)
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    
    // Determine overall status
    if (checks.some(check => check.status === 'unhealthy')) {
      status = 'unhealthy'
    } else if (checks.some(check => check.status === 'degraded')) {
      status = 'degraded'
    }

    return {
      status,
      checks,
      alerts: unresolvedAlerts,
      uptime: process.uptime(),
      lastCheck: checks.length > 0 ? Math.max(...checks.map(c => c.timestamp.getTime())) 
        ? new Date(Math.max(...checks.map(c => c.timestamp.getTime()))) 
        : new Date() : new Date()
    }
  }

  /**
   * Get metrics for a time range
   */
  getMetrics(minutes: number = 60): SystemMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.metrics.filter(metric => metric.timestamp >= cutoff)
  }

  /**
   * Get alert history
   */
  getAlerts(resolved: boolean | undefined = undefined): Alert[] {
    if (resolved === undefined) {
      return this.alerts
    }
    return this.alerts.filter(alert => alert.resolved === resolved)
  }

  /**
   * Generate health report
   */
  generateHealthReport(): any {
    const status = this.getSystemStatus()
    const recentMetrics = this.getMetrics(60) // Last hour
    
    return {
      summary: {
        status: status.status,
        uptime: status.uptime,
        lastCheck: status.lastCheck,
        totalChecks: status.checks.length,
        unhealthyChecks: status.checks.filter(c => c.status === 'unhealthy').length,
        activeAlerts: status.alerts.length
      },
      healthChecks: status.checks,
      alerts: status.alerts,
      metrics: {
        count: recentMetrics.length,
        latest: recentMetrics[recentMetrics.length - 1],
        averages: this.calculateMetricAverages(recentMetrics)
      },
      recommendations: this.generateRecommendations(status, recentMetrics)
    }
  }

  private calculateMetricAverages(metrics: SystemMetrics[]) {
    if (metrics.length === 0) return null

    return {
      responseTime: metrics.reduce((sum, m) => sum + m.api.averageResponseTime, 0) / metrics.length,
      errorRate: metrics.reduce((sum, m) => sum + m.api.errorRate, 0) / metrics.length,
      memoryUsage: metrics.reduce((sum, m) => sum + m.system.memory.heapUsed, 0) / metrics.length,
      dbLatency: metrics.reduce((sum, m) => sum + m.database.queryTime, 0) / metrics.length
    }
  }

  private generateRecommendations(status: any, metrics: SystemMetrics[]): string[] {
    const recommendations = []

    if (status.checks.some((c: any) => c.name === 'Database' && c.status !== 'healthy')) {
      recommendations.push('Check database connection and optimize slow queries')
    }

    if (status.checks.some((c: any) => c.name === 'Memory' && c.details?.usagePercent > 80)) {
      recommendations.push('Consider scaling up memory or optimizing memory-intensive operations')
    }

    if (status.alerts.length > 0) {
      recommendations.push('Review and resolve active alerts')
    }

    const avgErrorRate = metrics.length > 0 ? 
      metrics.reduce((sum, m) => sum + m.api.errorRate, 0) / metrics.length : 0
    
    if (avgErrorRate > 0.02) {
      recommendations.push('Investigate high API error rate and improve error handling')
    }

    return recommendations
  }
}

// Export singleton instance
export const monitoring = new MonitoringSystem()

// Export types and enums
export { AlertType, AlertSeverity }
export type { HealthCheck, SystemMetrics, Alert }

// Export convenience functions
export const MonitoringUtils = {
  recordApiRequest: (responseTime: number, isError: boolean = false) => {
    monitoring.recordApiRequest(responseTime, isError)
  },

  getSystemStatus: () => monitoring.getSystemStatus(),
  
  getHealthReport: () => monitoring.generateHealthReport(),
  
  runHealthChecks: () => monitoring.runHealthChecks(),
  
  resolveAlert: (alertId: string) => monitoring.resolveAlert(alertId)
}

// Graceful shutdown
export async function gracefulMonitoringShutdown() {
  await logger.info(LogCategory.SYSTEM, 'Shutting down monitoring system')
  monitoring.stopMonitoring()
}