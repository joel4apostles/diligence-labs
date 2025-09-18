import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export enum LogCategory {
  AUTH = 'AUTH',
  API = 'API',
  DATABASE = 'DATABASE',
  PAYMENT = 'PAYMENT',
  EMAIL = 'EMAIL',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  USER_ACTION = 'USER_ACTION',
  SYSTEM = 'SYSTEM',
  EXPERT = 'EXPERT',
  PROJECT = 'PROJECT',
  ADMIN = 'ADMIN'
}

interface LogData {
  level: LogLevel
  category: LogCategory
  message: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  url?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: any
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logToDatabase = process.env.LOG_TO_DATABASE === 'true'

  async log(data: LogData): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...data,
      error: data.error ? this.serializeError(data.error) : undefined
    }

    // Console logging
    this.logToConsole(logEntry)

    // Database logging (async, don't block)
    if (this.logToDatabase) {
      this.logToDatabase_async(logEntry).catch(err => 
        console.error('Failed to log to database:', err)
      )
    }

    // File logging (in production)
    if (!this.isDevelopment) {
      this.logToFile(logEntry)
    }
  }

  private logToConsole(entry: any): void {
    const color = this.getLogColor(entry.level)
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.category}]`
    
    if (entry.level === LogLevel.ERROR) {
      console.error(`${color}${prefix}${this.resetColor}`, entry.message, entry.error || '')
    } else if (entry.level === LogLevel.WARN) {
      console.warn(`${color}${prefix}${this.resetColor}`, entry.message)
    } else {
      console.log(`${color}${prefix}${this.resetColor}`, entry.message)
    }

    if (this.isDevelopment && entry.metadata) {
      console.log('  Metadata:', entry.metadata)
    }
  }

  private async logToDatabase_async(entry: any): Promise<void> {
    try {
      if (entry.userId) {
        await prisma.userActivityLog.create({
          data: {
            userId: entry.userId,
            action: `${entry.category}_${entry.level}`,
            details: JSON.stringify({
              message: entry.message,
              metadata: entry.metadata,
              error: entry.error,
              url: entry.url,
              method: entry.method,
              statusCode: entry.statusCode,
              duration: entry.duration
            }),
            ipAddress: entry.ipAddress || 'unknown'
          }
        })
      }
    } catch (error) {
      // Silently fail database logging to avoid infinite loops
      if (this.isDevelopment) {
        console.error('Database logging failed:', error)
      }
    }
  }

  private logToFile(entry: any): void {
    // In production, you'd implement file logging here
    // For now, we'll keep it simple with console logging
  }

  private serializeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      }
    }
    return error
  }

  private getLogColor(level: LogLevel): string {
    if (!this.isDevelopment) return ''
    
    switch (level) {
      case LogLevel.ERROR: return '\x1b[31m' // Red
      case LogLevel.WARN: return '\x1b[33m'  // Yellow
      case LogLevel.INFO: return '\x1b[36m'  // Cyan
      case LogLevel.DEBUG: return '\x1b[35m' // Magenta
      default: return ''
    }
  }

  private resetColor = this.isDevelopment ? '\x1b[0m' : ''

  // Convenience methods
  async error(category: LogCategory, message: string, error?: any, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      level: LogLevel.ERROR,
      category,
      message,
      error,
      metadata
    })
  }

  async warn(category: LogCategory, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      level: LogLevel.WARN,
      category,
      message,
      metadata
    })
  }

  async info(category: LogCategory, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      category,
      message,
      metadata
    })
  }

  async debug(category: LogCategory, message: string, metadata?: Record<string, any>): Promise<void> {
    if (this.isDevelopment) {
      await this.log({
        level: LogLevel.DEBUG,
        category,
        message,
        metadata
      })
    }
  }

  // API-specific logging
  async logApiRequest(
    method: string,
    url: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.info(LogCategory.API, `${method} ${url}`, {
      userId,
      ipAddress,
      userAgent,
      method,
      url
    })
  }

  async logApiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    error?: any
  ): Promise<void> {
    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO

    await this.log({
      level,
      category: LogCategory.API,
      message: `${method} ${url} - ${statusCode} (${duration}ms)`,
      userId,
      method,
      url,
      statusCode,
      duration,
      error
    })
  }

  // Security-specific logging
  async logSecurityEvent(message: string, userId?: string, ipAddress?: string, metadata?: Record<string, any>): Promise<void> {
    await this.error(LogCategory.SECURITY, message, undefined, {
      userId,
      ipAddress,
      ...metadata
    })
  }

  // User action logging
  async logUserAction(
    action: string,
    userId: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.info(LogCategory.USER_ACTION, `User ${userId} performed: ${action}`, {
      userId,
      ipAddress,
      ...details
    })
  }

  // Database operation logging
  async logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    error?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    const level = error ? LogLevel.ERROR : duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG

    await this.log({
      level,
      category: LogCategory.DATABASE,
      message: `${operation} on ${table} (${duration}ms)`,
      duration,
      error,
      metadata
    })
  }

  // Performance monitoring
  async logPerformanceMetric(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const level = duration > 5000 ? LogLevel.ERROR : 
                  duration > 2000 ? LogLevel.WARN : 
                  duration > 1000 ? LogLevel.INFO : 
                  LogLevel.DEBUG

    await this.log({
      level,
      category: LogCategory.PERFORMANCE,
      message: `${operation} completed in ${duration}ms`,
      duration,
      metadata
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Request/Response logging middleware helper
export function createApiLogger(category: LogCategory = LogCategory.API) {
  return {
    logRequest: async (request: Request, userId?: string) => {
      const start = Date.now()
      const url = new URL(request.url).pathname
      const method = request.method
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      await logger.logApiRequest(method, url, userId, ipAddress, userAgent)
      return start
    },

    logResponse: async (
      request: Request,
      statusCode: number,
      startTime: number,
      userId?: string,
      error?: any
    ) => {
      const duration = Date.now() - startTime
      const url = new URL(request.url).pathname
      const method = request.method

      await logger.logApiResponse(method, url, statusCode, duration, userId, error)
    }
  }
}

// Database query performance decorator
export function withDatabaseLogging<T extends any[], R>(
  operation: string,
  table: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now()
    try {
      const result = await fn(...args)
      const duration = Date.now() - start
      await logger.logDatabaseOperation(operation, table, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      await logger.logDatabaseOperation(operation, table, duration, error)
      throw error
    }
  }
}

// Performance monitoring decorator
export function withPerformanceLogging<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now()
    try {
      const result = await fn(...args)
      const duration = Date.now() - start
      await logger.logPerformanceMetric(operation, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      await logger.logPerformanceMetric(operation, duration, { error: true })
      throw error
    }
  }
}