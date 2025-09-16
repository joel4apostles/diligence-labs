/**
 * Production-ready logging utility
 * Replaces console.log statements with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isServer = typeof window === 'undefined'

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context })
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const logEntry = this.formatMessage(level, message, context)
    
    // Only log in development or if it's an error/warning
    if (!this.isDevelopment && level !== 'error' && level !== 'warn') {
      return
    }

    if (error) {
      logEntry.error = error
    }

    // Use appropriate console method
    const consoleMethod = level === 'debug' ? 'log' : level
    
    if (this.isServer) {
      // Server-side: structured logging
      console[consoleMethod](JSON.stringify(logEntry, null, 2))
    } else {
      // Client-side: readable logging
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '', error || '')
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log('error', message, context, error)
  }

  // Helper method for API route logging
  apiLog(method: string, path: string, status: number, duration?: number, context?: Record<string, unknown>) {
    this.info(`API ${method} ${path} ${status}`, {
      method,
      path,
      status,
      ...(duration && { duration: `${duration}ms` }),
      ...context
    })
  }

  // Helper method for authentication logging
  authLog(action: string, userId?: string, success: boolean = true, context?: Record<string, unknown>) {
    const level = success ? 'info' : 'warn'
    this.log(level, `Auth: ${action}`, {
      action,
      userId,
      success,
      ...context
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience methods for backward compatibility
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  api: logger.apiLog.bind(logger),
  auth: logger.authLog.bind(logger)
}