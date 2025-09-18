import { Redis } from 'ioredis'
import { logger, LogCategory } from './advanced-logger'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class RedisCache {
  private redis: Redis | null = null
  private fallbackCache = new Map<string, CacheEntry<any>>()
  private isRedisAvailable = false

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
      
      if (!redisUrl) {
        await logger.warn(LogCategory.SYSTEM, 'Redis URL not configured, using in-memory fallback')
        return
      }

      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableReadyCheck: false
      })

      await this.redis.ping()
      this.isRedisAvailable = true
      
      await logger.info(LogCategory.SYSTEM, 'Redis cache initialized successfully')
      
      // Set up error handlers
      this.redis.on('error', async (err) => {
        await logger.error(LogCategory.SYSTEM, 'Redis connection error', err)
        this.isRedisAvailable = false
      })

      this.redis.on('connect', async () => {
        await logger.info(LogCategory.SYSTEM, 'Redis connected')
        this.isRedisAvailable = true
      })

    } catch (error) {
      await logger.error(LogCategory.SYSTEM, 'Failed to initialize Redis', error)
      this.isRedisAvailable = false
    }
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.buildKey(key, options.prefix)
    
    try {
      if (this.isRedisAvailable && this.redis) {
        const cached = await this.redis.get(fullKey)
        if (cached) {
          const parsed = JSON.parse(cached)
          await logger.debug(LogCategory.PERFORMANCE, `Cache HIT for key: ${fullKey}`)
          return parsed
        }
      } else {
        // Fallback to in-memory cache
        const cached = this.fallbackCache.get(fullKey)
        if (cached && this.isValidEntry(cached)) {
          await logger.debug(LogCategory.PERFORMANCE, `Fallback cache HIT for key: ${fullKey}`)
          return cached.data
        }
        if (cached && !this.isValidEntry(cached)) {
          this.fallbackCache.delete(fullKey)
        }
      }
      
      await logger.debug(LogCategory.PERFORMANCE, `Cache MISS for key: ${fullKey}`)
      return null
      
    } catch (error) {
      await logger.error(LogCategory.SYSTEM, `Cache GET error for key: ${fullKey}`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.buildKey(key, options.prefix)
    const ttl = options.ttl || 300 // Default 5 minutes
    
    try {
      if (this.isRedisAvailable && this.redis) {
        const serialized = JSON.stringify(value)
        await this.redis.setex(fullKey, ttl, serialized)
        await logger.debug(LogCategory.PERFORMANCE, `Cache SET for key: ${fullKey} (TTL: ${ttl}s)`)
      } else {
        // Fallback to in-memory cache
        const entry: CacheEntry<T> = {
          data: value,
          timestamp: Date.now(),
          ttl: ttl * 1000 // Convert to milliseconds
        }
        this.fallbackCache.set(fullKey, entry)
        await logger.debug(LogCategory.PERFORMANCE, `Fallback cache SET for key: ${fullKey}`)
        
        // Clean up expired entries periodically
        this.cleanupFallbackCache()
      }
    } catch (error) {
      await logger.error(LogCategory.SYSTEM, `Cache SET error for key: ${fullKey}`, error)
    }
  }

  async del(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.buildKey(key, options.prefix)
    
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(fullKey)
      } else {
        this.fallbackCache.delete(fullKey)
      }
      await logger.debug(LogCategory.PERFORMANCE, `Cache DELETE for key: ${fullKey}`)
    } catch (error) {
      await logger.error(LogCategory.SYSTEM, `Cache DELETE error for key: ${fullKey}`, error)
    }
  }

  async flush(pattern?: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        if (pattern) {
          const keys = await this.redis.keys(pattern)
          if (keys.length > 0) {
            await this.redis.del(...keys)
          }
        } else {
          await this.redis.flushdb()
        }
      } else {
        if (pattern) {
          // Simple pattern matching for fallback cache
          for (const key of this.fallbackCache.keys()) {
            if (key.includes(pattern.replace('*', ''))) {
              this.fallbackCache.delete(key)
            }
          }
        } else {
          this.fallbackCache.clear()
        }
      }
      await logger.info(LogCategory.SYSTEM, `Cache flushed with pattern: ${pattern || 'ALL'}`)
    } catch (error) {
      await logger.error(LogCategory.SYSTEM, 'Cache flush error', error)
    }
  }

  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key
  }

  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  private cleanupFallbackCache(): void {
    // Run cleanup every minute
    if (this.fallbackCache.size > 1000) {
      for (const [key, entry] of this.fallbackCache.entries()) {
        if (!this.isValidEntry(entry)) {
          this.fallbackCache.delete(key)
        }
      }
    }
  }

  // Cache wrapper for database queries
  async cacheQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options)
    if (cached !== null) {
      return cached
    }

    const result = await queryFn()
    await this.set(key, result, options)
    return result
  }

  // Get cache statistics
  async getStats(): Promise<{
    redisAvailable: boolean
    fallbackCacheSize: number
    redis?: any
  }> {
    const stats = {
      redisAvailable: this.isRedisAvailable,
      fallbackCacheSize: this.fallbackCache.size
    }

    if (this.isRedisAvailable && this.redis) {
      try {
        const info = await this.redis.info('memory')
        return { ...stats, redis: { memory: info } }
      } catch (error) {
        return stats
      }
    }

    return stats
  }
}

// Export singleton instance
export const cache = new RedisCache()

// Cache key builders for common patterns
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  expert: (expertId: string) => `expert:${expertId}`,
  project: (projectId: string) => `project:${projectId}`,
  expertProjects: (expertId: string, page: number, filters: string) => 
    `expert:${expertId}:projects:${page}:${filters}`,
  adminExperts: (page: number, status: string) => 
    `admin:experts:${page}:${status}`,
  projectAssignments: (projectId: string) => 
    `project:${projectId}:assignments`,
  userReputation: (userId: string) => 
    `user:${userId}:reputation`,
  subscriptionPlans: () => 'subscription:plans',
  expertStats: (expertId: string) => 
    `expert:${expertId}:stats`
}

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60,        // 1 minute - frequently changing data
  MEDIUM: 300,      // 5 minutes - moderate change frequency
  LONG: 1800,       // 30 minutes - stable data
  VERY_LONG: 3600,  // 1 hour - rarely changing data
  DAY: 86400        // 24 hours - static configuration data
}

// Typed cache helpers
export const CacheHelpers = {
  // Cache user data
  cacheUser: async (userId: string, userData: any, ttl = CacheTTL.MEDIUM) => {
    await cache.set(CacheKeys.user(userId), userData, { ttl })
  },

  // Cache expert profile with assignments
  cacheExpert: async (expertId: string, expertData: any, ttl = CacheTTL.MEDIUM) => {
    await cache.set(CacheKeys.expert(expertId), expertData, { ttl })
  },

  // Cache project data
  cacheProject: async (projectId: string, projectData: any, ttl = CacheTTL.SHORT) => {
    await cache.set(CacheKeys.project(projectId), projectData, { ttl })
  },

  // Invalidate related caches when data changes
  invalidateUserCaches: async (userId: string) => {
    await Promise.all([
      cache.del(CacheKeys.user(userId)),
      cache.del(CacheKeys.userReputation(userId)),
      cache.flush(`user:${userId}:*`)
    ])
  },

  invalidateExpertCaches: async (expertId: string) => {
    await Promise.all([
      cache.del(CacheKeys.expert(expertId)),
      cache.del(CacheKeys.expertStats(expertId)),
      cache.flush(`expert:${expertId}:*`)
    ])
  },

  invalidateProjectCaches: async (projectId: string) => {
    await Promise.all([
      cache.del(CacheKeys.project(projectId)),
      cache.del(CacheKeys.projectAssignments(projectId)),
      cache.flush(`project:${projectId}:*`)
    ])
  }
}