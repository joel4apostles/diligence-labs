import { NextRequest, NextResponse } from 'next/server'
import { logger, LogCategory } from './advanced-logger'
import { cache } from './redis-cache'

interface RateLimitConfig {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
  onLimitReached?: (req: NextRequest, rateLimitInfo: RateLimitInfo) => Promise<void>
}

interface RateLimitInfo {
  totalHits: number
  remainingPoints: number
  msBeforeNext: number
  isFirstInDuration: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

class RateLimiter {
  private fallbackStorage = new Map<string, RateLimitEntry>()

  constructor(private config: RateLimitConfig) {}

  async isAllowed(req: NextRequest): Promise<{
    allowed: boolean
    rateLimitInfo: RateLimitInfo
    headers: Record<string, string>
  }> {
    const key = this.generateKey(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Try Redis first, fallback to in-memory
      let entry = await this.getEntry(key)
      
      if (!entry || entry.resetTime <= now) {
        // Create new window
        entry = {
          count: 1,
          resetTime: now + this.config.windowMs,
          firstRequest: now
        }
        await this.setEntry(key, entry)
        
        return {
          allowed: true,
          rateLimitInfo: {
            totalHits: 1,
            remainingPoints: this.config.maxRequests - 1,
            msBeforeNext: this.config.windowMs,
            isFirstInDuration: true
          },
          headers: this.buildHeaders(entry, this.config.maxRequests)
        }
      }

      // Check if limit exceeded
      if (entry.count >= this.config.maxRequests) {
        const rateLimitInfo = {
          totalHits: entry.count,
          remainingPoints: 0,
          msBeforeNext: entry.resetTime - now,
          isFirstInDuration: false
        }

        // Log rate limit exceeded
        await logger.warn(LogCategory.SECURITY, `Rate limit exceeded for key: ${key}`, {
          ip: this.getClientIP(req),
          userAgent: req.headers.get('user-agent'),
          path: req.nextUrl.pathname,
          rateLimitInfo
        })

        // Call custom handler if provided
        if (this.config.onLimitReached) {
          await this.config.onLimitReached(req, rateLimitInfo)
        }

        return {
          allowed: false,
          rateLimitInfo,
          headers: this.buildHeaders(entry, this.config.maxRequests)
        }
      }

      // Increment counter
      entry.count++
      await this.setEntry(key, entry)

      return {
        allowed: true,
        rateLimitInfo: {
          totalHits: entry.count,
          remainingPoints: this.config.maxRequests - entry.count,
          msBeforeNext: entry.resetTime - now,
          isFirstInDuration: false
        },
        headers: this.buildHeaders(entry, this.config.maxRequests)
      }

    } catch (error) {
      await logger.error(LogCategory.SYSTEM, `Rate limiter error for key: ${key}`, error)
      
      // On error, allow the request but log the issue
      return {
        allowed: true,
        rateLimitInfo: {
          totalHits: 0,
          remainingPoints: this.config.maxRequests,
          msBeforeNext: this.config.windowMs,
          isFirstInDuration: true
        },
        headers: {}
      }
    }
  }

  private async getEntry(key: string): Promise<RateLimitEntry | null> {
    try {
      const cached = await cache.get<RateLimitEntry>(`ratelimit:${key}`)
      if (cached) return cached

      // Fallback to in-memory
      return this.fallbackStorage.get(key) || null
    } catch (error) {
      return this.fallbackStorage.get(key) || null
    }
  }

  private async setEntry(key: string, entry: RateLimitEntry): Promise<void> {
    try {
      const ttlSeconds = Math.ceil(this.config.windowMs / 1000)
      await cache.set(`ratelimit:${key}`, entry, { ttl: ttlSeconds })
    } catch (error) {
      // Fallback to in-memory with cleanup
      this.fallbackStorage.set(key, entry)
      this.cleanupFallbackStorage()
    }
  }

  private cleanupFallbackStorage(): void {
    const now = Date.now()
    for (const [key, entry] of this.fallbackStorage.entries()) {
      if (entry.resetTime <= now) {
        this.fallbackStorage.delete(key)
      }
    }
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }

    // Default key generation: IP + User Agent + Path
    const ip = this.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const path = req.nextUrl.pathname
    
    return `${ip}:${this.hashString(userAgent)}:${path}`
  }

  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const cfConnectingIp = req.headers.get('cf-connecting-ip')
    
    return cfConnectingIp || 
           forwarded?.split(',')[0] || 
           realIp || 
           'unknown'
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString()
  }

  private buildHeaders(entry: RateLimitEntry, maxRequests: number): Record<string, string> {
    const now = Date.now()
    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
      'X-RateLimit-ResetTime': new Date(entry.resetTime).toISOString(),
      'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const RateLimiters = {
  // Authentication endpoints - stricter limits
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    onLimitReached: async (req, info) => {
      await logger.error(LogCategory.SECURITY, 'Authentication rate limit exceeded', undefined, {
        ip: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
        path: req.nextUrl.pathname,
        rateLimitInfo: info
      })
    }
  }),

  // API endpoints - moderate limits
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  }),

  // Expert dashboard - higher limits for authenticated users
  expertDashboard: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    keyGenerator: (req) => {
      // Use user ID if available in session/header
      const userId = req.headers.get('x-user-id') || req.headers.get('x-forwarded-for') || 'unknown'
      return `expert:${userId}`
    }
  }),

  // Admin endpoints - moderate limits
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 150, // 150 requests per minute
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || req.headers.get('x-forwarded-for') || 'unknown'
      return `admin:${userId}`
    }
  }),

  // File upload endpoints - lower limits
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
  }),

  // General public endpoints
  public: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  })
}

// Middleware wrapper for Next.js API routes
export function withRateLimit(limiter: RateLimiter) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const { allowed, rateLimitInfo, headers } = await limiter.isAllowed(req)
    
    if (!allowed) {
      const response = NextResponse.json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitInfo.msBeforeNext / 1000)} seconds.`,
        retryAfter: Math.ceil(rateLimitInfo.msBeforeNext / 1000)
      }, { status: 429 })

      // Add rate limit headers
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    // Continue with the original handler
    try {
      const response = await handler(req)
      
      // Add rate limit headers to successful responses
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    } catch (error) {
      throw error
    }
  }
}

// Helper function to apply rate limiting to API routes
export function createRateLimitedHandler(
  limiter: RateLimiter,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withRateLimit(limiter)(req => handler(req))
}

// Utility to get rate limit status
export async function getRateLimitStatus(req: NextRequest, limiter: RateLimiter) {
  const { rateLimitInfo, headers } = await limiter.isAllowed(req)
  return { rateLimitInfo, headers }
}

// Rate limit bypass for trusted IPs (add to environment variables)
export function isTrustedIP(req: NextRequest): boolean {
  const trustedIPs = (process.env.TRUSTED_IPS || '').split(',').filter(Boolean)
  if (trustedIPs.length === 0) return false
  
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                   req.headers.get('x-real-ip') ||
                   req.headers.get('cf-connecting-ip')
                   
  return trustedIPs.includes(clientIP || '')
}

// Advanced rate limiting with different tiers based on user subscription
export class TieredRateLimiter {
  private limiters: Map<string, RateLimiter> = new Map()

  constructor(private configs: Record<string, RateLimitConfig>) {
    Object.entries(configs).forEach(([tier, config]) => {
      this.limiters.set(tier, new RateLimiter(config))
    })
  }

  async checkLimit(req: NextRequest, userTier: string = 'free'): Promise<{
    allowed: boolean
    rateLimitInfo: RateLimitInfo
    headers: Record<string, string>
  }> {
    const limiter = this.limiters.get(userTier) || this.limiters.get('free')
    if (!limiter) {
      throw new Error(`No rate limiter configured for tier: ${userTier}`)
    }
    
    return limiter.isAllowed(req)
  }
}

// Pre-configured tiered rate limiter for subscription-based limits
export const SubscriptionRateLimiter = new TieredRateLimiter({
  free: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  },
  basic: {
    windowMs: 60 * 1000,
    maxRequests: 100, // 100 requests per minute
  },
  professional: {
    windowMs: 60 * 1000,
    maxRequests: 300, // 300 requests per minute
  },
  enterprise: {
    windowMs: 60 * 1000,
    maxRequests: 1000, // 1000 requests per minute
  },
  vc: {
    windowMs: 60 * 1000,
    maxRequests: 2000, // 2000 requests per minute
  },
  ecosystem: {
    windowMs: 60 * 1000,
    maxRequests: 5000, // 5000 requests per minute
  }
})