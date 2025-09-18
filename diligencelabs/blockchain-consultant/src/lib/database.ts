import { PrismaClient } from '@prisma/client'
import { logger, LogCategory } from './advanced-logger'

declare global {
  var __prisma: PrismaClient | undefined
}

interface DatabaseConfig {
  maxConnections: number
  connectionTimeout: number
  acquireTimeout: number
  createTimeout: number
  destroyTimeout: number
  reapInterval: number
  createRetryInterval: number
  idleTimeout: number
  logLevel: 'info' | 'query' | 'warn' | 'error'
}

class DatabaseManager {
  private static instance: DatabaseManager
  private prisma: PrismaClient | null = null
  private isConnected = false
  private connectionAttempts = 0
  private maxRetries = 5

  private config: DatabaseConfig = {
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000'),
    acquireTimeout: parseInt(process.env.DATABASE_ACQUIRE_TIMEOUT || '60000'),
    createTimeout: parseInt(process.env.DATABASE_CREATE_TIMEOUT || '30000'),
    destroyTimeout: parseInt(process.env.DATABASE_DESTROY_TIMEOUT || '5000'),
    reapInterval: parseInt(process.env.DATABASE_REAP_INTERVAL || '1000'),
    createRetryInterval: parseInt(process.env.DATABASE_CREATE_RETRY_INTERVAL || '200'),
    idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
    logLevel: (process.env.DATABASE_LOG_LEVEL as any) || 'warn'
  }

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async initialize(): Promise<PrismaClient> {
    if (this.prisma && this.isConnected) {
      return this.prisma
    }

    try {
      await logger.info(LogCategory.DATABASE, 'Initializing database connection pool')

      // In development, use global to prevent too many instances
      if (process.env.NODE_ENV === 'development') {
        if (!global.__prisma) {
          global.__prisma = this.createPrismaClient()
        }
        this.prisma = global.__prisma
      } else {
        this.prisma = this.createPrismaClient()
      }

      // Test connection
      await this.testConnection()
      this.isConnected = true
      this.connectionAttempts = 0

      await logger.info(LogCategory.DATABASE, 'Database connection pool initialized successfully', {
        maxConnections: this.config.maxConnections,
        environment: process.env.NODE_ENV
      })

      // Set up connection event handlers
      this.setupEventHandlers()

      return this.prisma
    } catch (error) {
      this.connectionAttempts++
      await logger.error(LogCategory.DATABASE, `Database initialization failed (attempt ${this.connectionAttempts})`, error)

      if (this.connectionAttempts < this.maxRetries) {
        await logger.info(LogCategory.DATABASE, `Retrying database connection in ${this.config.createRetryInterval}ms`)
        await this.sleep(this.config.createRetryInterval * this.connectionAttempts)
        return this.initialize()
      }

      throw new Error(`Failed to initialize database after ${this.maxRetries} attempts`)
    }
  }

  private createPrismaClient(): PrismaClient {
    return new PrismaClient({
      log: [
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'query', emit: 'event' }
      ],
      datasources: {
        db: {
          url: this.buildDatabaseUrl()
        }
      }
    })
  }

  private buildDatabaseUrl(): string {
    const baseUrl = process.env.DATABASE_URL
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Add connection pool parameters for PostgreSQL
    if (baseUrl.startsWith('postgresql://') || baseUrl.startsWith('postgres://')) {
      const url = new URL(baseUrl)
      
      // Add pool parameters
      url.searchParams.set('pool_timeout', (this.config.acquireTimeout / 1000).toString())
      url.searchParams.set('connection_limit', this.config.maxConnections.toString())
      url.searchParams.set('connect_timeout', (this.config.connectionTimeout / 1000).toString())
      
      // Optimize for production
      if (process.env.NODE_ENV === 'production') {
        url.searchParams.set('sslmode', 'require')
        url.searchParams.set('statement_cache_size', '100')
        url.searchParams.set('prepared_statements', 'true')
      }

      return url.toString()
    }

    return baseUrl
  }

  private async testConnection(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma client not initialized')
    }

    const start = Date.now()
    try {
      await this.prisma.$queryRaw`SELECT 1`
      const duration = Date.now() - start
      await logger.info(LogCategory.DATABASE, `Database connection test successful (${duration}ms)`)
    } catch (error) {
      await logger.error(LogCategory.DATABASE, 'Database connection test failed', error)
      throw error
    }
  }

  private setupEventHandlers(): void {
    if (!this.prisma) return

    // Log database queries in development
    this.prisma.$on('query', async (e) => {
      if (process.env.NODE_ENV === 'development' && this.config.logLevel === 'query') {
        await logger.debug(LogCategory.DATABASE, `Query: ${e.query}`, {
          duration: e.duration,
          params: e.params
        })
      }

      // Log slow queries
      if (e.duration > 1000) {
        await logger.warn(LogCategory.DATABASE, `Slow query detected (${e.duration}ms)`, {
          query: e.query,
          params: e.params,
          duration: e.duration
        })
      }
    })

    // Log database errors
    this.prisma.$on('error', async (e) => {
      await logger.error(LogCategory.DATABASE, 'Database error', e)
    })

    // Log database warnings
    this.prisma.$on('warn', async (e) => {
      await logger.warn(LogCategory.DATABASE, 'Database warning', { message: e.message })
    })

    // Log database info
    this.prisma.$on('info', async (e) => {
      await logger.info(LogCategory.DATABASE, 'Database info', { message: e.message })
    })
  }

  async getClient(): Promise<PrismaClient> {
    if (!this.prisma || !this.isConnected) {
      return this.initialize()
    }
    return this.prisma
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      try {
        await logger.info(LogCategory.DATABASE, 'Disconnecting database')
        await this.prisma.$disconnect()
        this.isConnected = false
        await logger.info(LogCategory.DATABASE, 'Database disconnected successfully')
      } catch (error) {
        await logger.error(LogCategory.DATABASE, 'Error during database disconnection', error)
        throw error
      }
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    connections: number
    error?: string
  }> {
    const start = Date.now()
    
    try {
      if (!this.prisma) {
        return {
          status: 'unhealthy',
          latency: 0,
          connections: 0,
          error: 'Database client not initialized'
        }
      }

      // Simple query to test connectivity
      await this.prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - start

      // Get connection info (PostgreSQL specific)
      let connections = 0
      try {
        const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'
        `
        connections = Number(result[0]?.count || 0)
      } catch (error) {
        // Ignore connection count errors for non-PostgreSQL databases
      }

      return {
        status: latency < 1000 ? 'healthy' : 'unhealthy',
        latency,
        connections
      }
    } catch (error) {
      const latency = Date.now() - start
      return {
        status: 'unhealthy',
        latency,
        connections: 0,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  async getConnectionStats(): Promise<{
    totalConnections: number
    activeConnections: number
    idleConnections: number
    waitingConnections: number
  }> {
    try {
      if (!this.prisma) {
        throw new Error('Database client not initialized')
      }

      // PostgreSQL specific query
      const stats = await this.prisma.$queryRaw<Array<{
        state: string
        count: bigint
      }>>`
        SELECT state, COUNT(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state
      `

      let activeConnections = 0
      let idleConnections = 0

      for (const stat of stats) {
        if (stat.state === 'active') {
          activeConnections = Number(stat.count)
        } else if (stat.state === 'idle') {
          idleConnections = Number(stat.count)
        }
      }

      return {
        totalConnections: activeConnections + idleConnections,
        activeConnections,
        idleConnections,
        waitingConnections: 0 // Would need additional query for this
      }
    } catch (error) {
      await logger.warn(LogCategory.DATABASE, 'Could not retrieve connection stats', error)
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingConnections: 0
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Graceful shutdown
  async gracefulShutdown(): Promise<void> {
    await logger.info(LogCategory.DATABASE, 'Starting graceful database shutdown')
    
    try {
      // Wait for active connections to finish (max 30 seconds)
      const maxWait = 30000
      const checkInterval = 1000
      let waited = 0

      while (waited < maxWait) {
        const stats = await this.getConnectionStats()
        if (stats.activeConnections === 0) {
          break
        }
        
        await logger.info(LogCategory.DATABASE, `Waiting for ${stats.activeConnections} active connections to finish`)
        await this.sleep(checkInterval)
        waited += checkInterval
      }

      await this.disconnect()
      await logger.info(LogCategory.DATABASE, 'Database graceful shutdown completed')
    } catch (error) {
      await logger.error(LogCategory.DATABASE, 'Error during graceful shutdown', error)
      throw error
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance()

// Export convenience function
export async function getDatabase(): Promise<PrismaClient> {
  return databaseManager.getClient()
}

// Transaction helper with retry logic
export async function withTransaction<T>(
  operation: (tx: PrismaClient) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  const db = await getDatabase()
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        return operation(tx)
      }, {
        maxWait: 30000, // 30 seconds
        timeout: 60000, // 60 seconds
        isolationLevel: 'ReadCommitted'
      })
    } catch (error) {
      lastError = error as Error
      
      await logger.warn(LogCategory.DATABASE, `Transaction attempt ${attempt} failed`, error)
      
      // Check if error is retryable
      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff
        await logger.info(LogCategory.DATABASE, `Retrying transaction in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      throw error
    }
  }

  throw lastError!
}

// Check if database error is retryable
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  
  const retryableErrors = [
    'connection terminated',
    'connection reset',
    'timeout',
    'deadlock',
    'serialization failure'
  ]
  
  return retryableErrors.some(msg => 
    error.message.toLowerCase().includes(msg)
  )
}

// Database metrics for monitoring
export async function getDatabaseMetrics(): Promise<{
  health: any
  connections: any
  queryStats?: any
}> {
  const health = await databaseManager.healthCheck()
  const connections = await databaseManager.getConnectionStats()
  
  // Additional metrics can be added here
  return {
    health,
    connections
  }
}

// Graceful shutdown handler
export async function gracefulDatabaseShutdown(): Promise<void> {
  await databaseManager.gracefulShutdown()
}

// Initialize database on module load for production
if (process.env.NODE_ENV === 'production') {
  databaseManager.initialize().catch(async (error) => {
    await logger.error(LogCategory.DATABASE, 'Failed to initialize database on startup', error)
    process.exit(1)
  })
}