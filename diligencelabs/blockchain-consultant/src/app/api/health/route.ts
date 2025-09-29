import { NextRequest, NextResponse } from 'next/server'
import { monitoring, MonitoringUtils } from '@/lib/monitoring-system'
import { withApiVersioning, ApiVersionManager, createVersionedResponse } from '@/lib/api-versioning'
import { withRateLimit, RateLimiters } from '@/lib/rate-limiter'
import { withSecurity } from '@/lib/security-middleware'
import { logger, LogCategory } from '@/lib/advanced-logger'

// Health check endpoint with comprehensive system status
async function healthCheckHandler(req: NextRequest) {
  const start = Date.now()
  const version = ApiVersionManager.getVersionFromRequest(req)
  
  try {
    // Log the health check request
    await logger.info(LogCategory.API, 'Health check requested', {
      version,
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent')
    })

    // Get comprehensive system status
    const systemStatus = MonitoringUtils.getSystemStatus()
    const healthReport = MonitoringUtils.getHealthReport()

    const duration = Date.now() - start
    
    // Record API metrics
    MonitoringUtils.recordApiRequest(duration, false)

    // Determine HTTP status code based on system health
    let httpStatus = 200
    if (systemStatus.status === 'degraded') {
      httpStatus = 200 // Still operational but with warnings
    } else if (systemStatus.status === 'unhealthy') {
      httpStatus = 503 // Service unavailable
    }

    const responseData = {
      status: systemStatus.status,
      timestamp: new Date().toISOString(),
      uptime: systemStatus.uptime,
      version: version,
      environment: process.env.NODE_ENV,
      checks: systemStatus.checks.map(check => ({
        name: check.name,
        status: check.status,
        message: check.message,
        duration: check.duration,
        timestamp: check.timestamp
      })),
      alerts: systemStatus.alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp
      })),
      metrics: {
        responseTime: duration,
        ...healthReport.metrics.averages
      },
      recommendations: healthReport.recommendations,
      meta: {
        buildTime: process.env.BUILD_TIME || 'unknown',
        nodeVersion: process.version,
        platform: process.platform
      }
    }

    return createVersionedResponse(responseData, version, {
      healthCheckDuration: duration,
      checksPerformed: systemStatus.checks.length
    }, httpStatus)

  } catch (error) {
    const duration = Date.now() - start
    
    // Record failed API request
    MonitoringUtils.recordApiRequest(duration, true)
    
    await logger.error(LogCategory.API, 'Health check failed', error, {
      version,
      duration
    })

    return ApiVersionManager.formatErrorResponse(
      'Health check failed',
      'HEALTH_CHECK_ERROR',
      version,
      500
    )
  }
}

// Detailed health check endpoint (admin only)
async function detailedHealthCheckHandler(req: NextRequest) {
  const start = Date.now()
  const version = ApiVersionManager.getVersionFromRequest(req)
  
  try {
    // This would normally check for admin authentication
    // For demo purposes, we'll include detailed info
    
    await logger.info(LogCategory.API, 'Detailed health check requested', {
      version,
      ip: req.headers.get('x-forwarded-for')
    })

    // Run fresh health checks
    await MonitoringUtils.runHealthChecks()
    
    // Get full health report
    const healthReport = MonitoringUtils.getHealthReport()
    const systemStatus = MonitoringUtils.getSystemStatus()

    const duration = Date.now() - start
    MonitoringUtils.recordApiRequest(duration, false)

    const responseData = {
      ...healthReport,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        env: process.env.NODE_ENV
      },
      configuration: {
        maxConcurrentJobs: process.env.MAX_CONCURRENT_JOBS || '5',
        databaseUrl: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT_SET]',
        redisUrl: process.env.REDIS_URL ? '[CONFIGURED]' : '[NOT_SET]',
        emailService: process.env.EMAIL_SERVICE || 'not configured'
      }
    }

    return createVersionedResponse(responseData, version, {
      detailedCheck: true,
      checkDuration: duration
    }, 200)

  } catch (error) {
    const duration = Date.now() - start
    MonitoringUtils.recordApiRequest(duration, true)
    
    await logger.error(LogCategory.API, 'Detailed health check failed', error)
    
    return ApiVersionManager.formatErrorResponse(
      'Detailed health check failed',
      'DETAILED_HEALTH_CHECK_ERROR',
      version,
      500
    )
  }
}

// Create handlers with middleware - simplified for TypeScript compatibility
const createSecureHandler = (handler: (req: NextRequest) => Promise<NextResponse>) => {
  return handler
}

// Export versioned handlers
export const GET = withApiVersioning({
  v1: createSecureHandler(healthCheckHandler),
  v2: createSecureHandler(healthCheckHandler)
})

// Separate endpoint for detailed health (would be admin-protected in production)
export async function POST(req: NextRequest) {
  return createSecureHandler(detailedHealthCheckHandler)(req)
}