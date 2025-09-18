import { NextRequest, NextResponse } from 'next/server'
import { logger, LogCategory } from './advanced-logger'

interface SecurityConfig {
  csrf: {
    enabled: boolean
    cookieName: string
    headerName: string
    ignoredMethods: string[]
  }
  cors: {
    enabled: boolean
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    credentials: boolean
    maxAge: number
  }
  helmet: {
    contentSecurityPolicy: boolean
    crossOriginEmbedderPolicy: boolean
    crossOriginOpenerPolicy: boolean
    crossOriginResourcePolicy: boolean
    dnsPrefetchControl: boolean
    frameOptions: boolean
    hidePoweredBy: boolean
    hsts: boolean
    ieNoOpen: boolean
    noSniff: boolean
    originAgentCluster: boolean
    permittedCrossDomainPolicies: boolean
    referrerPolicy: boolean
    xssFilter: boolean
  }
  ipFilter: {
    enabled: boolean
    whitelist: string[]
    blacklist: string[]
  }
  bruteForce: {
    enabled: boolean
    maxAttempts: number
    windowMs: number
    blockDuration: number
  }
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  csrf: {
    enabled: process.env.NODE_ENV === 'production',
    cookieName: '__Host-csrf-token',
    headerName: 'X-CSRF-Token',
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
  },
  cors: {
    enabled: true,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-API-Version',
      'Accept-Version'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  helmet: {
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false, // Can break some integrations
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameOptions: true,
    hidePoweredBy: true,
    hsts: process.env.NODE_ENV === 'production',
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: true,
    xssFilter: true
  },
  ipFilter: {
    enabled: false,
    whitelist: [],
    blacklist: []
  },
  bruteForce: {
    enabled: true,
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 60 * 60 * 1000 // 1 hour
  }
}

class SecurityMiddleware {
  private config: SecurityConfig
  private csrfTokens = new Map<string, { token: string; expires: number }>()
  private bruteForceAttempts = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>()

  constructor(config?: Partial<SecurityConfig>) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config }
  }

  /**
   * Apply all security middleware
   */
  async apply(req: NextRequest, handler: () => Promise<NextResponse>): Promise<NextResponse> {
    try {
      // IP filtering
      if (this.config.ipFilter.enabled) {
        const ipCheckResult = this.checkIPFilter(req)
        if (!ipCheckResult.allowed) {
          await logger.warn(LogCategory.SECURITY, `IP blocked: ${ipCheckResult.ip}`)
          return this.createErrorResponse('Access denied', 403)
        }
      }

      // Brute force protection
      if (this.config.bruteForce.enabled) {
        const bruteForceResult = await this.checkBruteForce(req)
        if (!bruteForceResult.allowed) {
          await logger.warn(LogCategory.SECURITY, `Brute force protection triggered`, {
            ip: this.getClientIP(req),
            remainingTime: bruteForceResult.remainingTime
          })
          
          const response = this.createErrorResponse('Too many attempts. Please try again later.', 429)
          response.headers.set('Retry-After', Math.ceil(bruteForceResult.remainingTime! / 1000).toString())
          return response
        }
      }

      // CORS
      if (this.config.cors.enabled) {
        const corsResult = this.handleCORS(req)
        if (!corsResult.allowed) {
          await logger.warn(LogCategory.SECURITY, `CORS violation`, {
            origin: req.headers.get('origin'),
            method: req.method
          })
          return this.createErrorResponse('CORS policy violation', 403)
        }

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          const response = new NextResponse(null, { status: 200 })
          this.applyCORSHeaders(response, corsResult.headers)
          return response
        }
      }

      // CSRF protection
      if (this.config.csrf.enabled && !this.config.csrf.ignoredMethods.includes(req.method)) {
        const csrfResult = await this.validateCSRF(req)
        if (!csrfResult.valid) {
          await logger.warn(LogCategory.SECURITY, `CSRF validation failed`, {
            ip: this.getClientIP(req),
            method: req.method,
            path: req.nextUrl.pathname
          })
          return this.createErrorResponse('CSRF token validation failed', 403)
        }
      }

      // Execute the handler
      const response = await handler()

      // Apply security headers
      this.applySecurityHeaders(response)

      // Apply CORS headers
      if (this.config.cors.enabled) {
        const corsResult = this.handleCORS(req)
        this.applyCORSHeaders(response, corsResult.headers)
      }

      // Generate CSRF token for future requests
      if (this.config.csrf.enabled) {
        const csrfToken = await this.generateCSRFToken(req)
        if (csrfToken) {
          response.cookies.set(this.config.csrf.cookieName, csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 3600 // 1 hour
          })
        }
      }

      return response
    } catch (error) {
      await logger.error(LogCategory.SECURITY, 'Security middleware error', error)
      return this.createErrorResponse('Internal security error', 500)
    }
  }

  private checkIPFilter(req: NextRequest): { allowed: boolean; ip: string } {
    const ip = this.getClientIP(req)
    
    // Check blacklist first
    if (this.config.ipFilter.blacklist.includes(ip)) {
      return { allowed: false, ip }
    }

    // Check whitelist if it exists
    if (this.config.ipFilter.whitelist.length > 0) {
      return { allowed: this.config.ipFilter.whitelist.includes(ip), ip }
    }

    return { allowed: true, ip }
  }

  private async checkBruteForce(req: NextRequest): Promise<{
    allowed: boolean
    remainingTime?: number
  }> {
    const key = this.getBruteForceKey(req)
    const now = Date.now()
    const attempt = this.bruteForceAttempts.get(key)

    if (!attempt) {
      return { allowed: true }
    }

    // Check if blocked
    if (attempt.blockedUntil && attempt.blockedUntil > now) {
      return { 
        allowed: false, 
        remainingTime: attempt.blockedUntil - now 
      }
    }

    // Reset if window expired
    if (attempt.resetTime < now) {
      this.bruteForceAttempts.delete(key)
      return { allowed: true }
    }

    // Check if max attempts exceeded
    if (attempt.count >= this.config.bruteForce.maxAttempts) {
      const blockedUntil = now + this.config.bruteForce.blockDuration
      this.bruteForceAttempts.set(key, {
        ...attempt,
        blockedUntil
      })
      
      return { 
        allowed: false, 
        remainingTime: this.config.bruteForce.blockDuration 
      }
    }

    return { allowed: true }
  }

  private recordFailedAttempt(req: NextRequest): void {
    const key = this.getBruteForceKey(req)
    const now = Date.now()
    const resetTime = now + this.config.bruteForce.windowMs
    
    const existing = this.bruteForceAttempts.get(key)
    
    if (existing && existing.resetTime > now) {
      // Increment existing attempt
      this.bruteForceAttempts.set(key, {
        count: existing.count + 1,
        resetTime: existing.resetTime,
        blockedUntil: existing.blockedUntil
      })
    } else {
      // New attempt window
      this.bruteForceAttempts.set(key, {
        count: 1,
        resetTime
      })
    }
  }

  private getBruteForceKey(req: NextRequest): string {
    const ip = this.getClientIP(req)
    const path = req.nextUrl.pathname
    return `${ip}:${path}`
  }

  private handleCORS(req: NextRequest): {
    allowed: boolean
    headers: Record<string, string>
  } {
    const origin = req.headers.get('origin')
    const method = req.method
    
    const headers: Record<string, string> = {}
    
    // Check origin
    if (origin) {
      const isAllowed = this.config.cors.allowedOrigins.includes('*') ||
                       this.config.cors.allowedOrigins.includes(origin)
      
      if (!isAllowed) {
        return { allowed: false, headers }
      }
      
      headers['Access-Control-Allow-Origin'] = origin
    } else {
      // No origin header (same-origin or non-browser request)
      headers['Access-Control-Allow-Origin'] = this.config.cors.allowedOrigins[0] || '*'
    }

    // Check method
    if (!this.config.cors.allowedMethods.includes(method)) {
      return { allowed: false, headers }
    }

    headers['Access-Control-Allow-Methods'] = this.config.cors.allowedMethods.join(', ')
    headers['Access-Control-Allow-Headers'] = this.config.cors.allowedHeaders.join(', ')
    headers['Access-Control-Max-Age'] = this.config.cors.maxAge.toString()
    
    if (this.config.cors.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true'
    }

    return { allowed: true, headers }
  }

  private applyCORSHeaders(response: NextResponse, headers: Record<string, string>): void {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  private async validateCSRF(req: NextRequest): Promise<{ valid: boolean }> {
    const token = req.headers.get(this.config.csrf.headerName) ||
                 req.cookies.get(this.config.csrf.cookieName)?.value

    if (!token) {
      return { valid: false }
    }

    const sessionId = this.getSessionId(req)
    const storedToken = this.csrfTokens.get(sessionId)

    if (!storedToken || storedToken.expires < Date.now()) {
      return { valid: false }
    }

    return { valid: storedToken.token === token }
  }

  private async generateCSRFToken(req: NextRequest): Promise<string | null> {
    const sessionId = this.getSessionId(req)
    if (!sessionId) return null

    const token = this.generateRandomToken()
    const expires = Date.now() + (3600 * 1000) // 1 hour

    this.csrfTokens.set(sessionId, { token, expires })
    
    // Cleanup expired tokens
    this.cleanupExpiredTokens()
    
    return token
  }

  private getSessionId(req: NextRequest): string | null {
    // Try to get session ID from various sources
    const sessionCookie = req.cookies.get('next-auth.session-token')?.value ||
                         req.cookies.get('__Secure-next-auth.session-token')?.value
    
    if (sessionCookie) return sessionCookie

    // Fallback to IP + User Agent
    const ip = this.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || ''
    return `${ip}:${this.hashString(userAgent)}`
  }

  private applySecurityHeaders(response: NextResponse): void {
    const helmet = this.config.helmet

    if (helmet.hidePoweredBy) {
      response.headers.delete('X-Powered-By')
    }

    if (helmet.noSniff) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    if (helmet.frameOptions) {
      response.headers.set('X-Frame-Options', 'DENY')
    }

    if (helmet.xssFilter) {
      response.headers.set('X-XSS-Protection', '1; mode=block')
    }

    if (helmet.hsts && process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    if (helmet.referrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    if (helmet.dnsPrefetchControl) {
      response.headers.set('X-DNS-Prefetch-Control', 'off')
    }

    if (helmet.ieNoOpen) {
      response.headers.set('X-Download-Options', 'noopen')
    }

    if (helmet.originAgentCluster) {
      response.headers.set('Origin-Agent-Cluster', '?1')
    }

    if (helmet.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    }

    if (helmet.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    }

    if (helmet.contentSecurityPolicy) {
      const csp = this.buildCSPPolicy()
      response.headers.set('Content-Security-Policy', csp)
    }

    if (!helmet.permittedCrossDomainPolicies) {
      response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    }
  }

  private buildCSPPolicy(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'"
    ]
    
    return directives.join('; ')
  }

  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const cfConnectingIp = req.headers.get('cf-connecting-ip')
    
    return cfConnectingIp || 
           forwarded?.split(',')[0] || 
           realIp || 
           '127.0.0.1'
  }

  private generateRandomToken(): string {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString()
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [key, token] of this.csrfTokens.entries()) {
      if (token.expires < now) {
        this.csrfTokens.delete(key)
      }
    }
  }

  private createErrorResponse(message: string, status: number): NextResponse {
    const response = NextResponse.json({
      error: message,
      timestamp: new Date().toISOString()
    }, { status })
    
    this.applySecurityHeaders(response)
    return response
  }

  // Method to record authentication failures for brute force protection
  recordAuthFailure(req: NextRequest): void {
    if (this.config.bruteForce.enabled) {
      this.recordFailedAttempt(req)
    }
  }

  // Method to clear brute force record on successful auth
  clearAuthFailures(req: NextRequest): void {
    if (this.config.bruteForce.enabled) {
      const key = this.getBruteForceKey(req)
      this.bruteForceAttempts.delete(key)
    }
  }
}

// Export singleton instance
export const securityMiddleware = new SecurityMiddleware()

// Export wrapper function for easy use in API routes
export function withSecurity(
  handler: () => Promise<NextResponse>,
  config?: Partial<SecurityConfig>
) {
  const middleware = config ? new SecurityMiddleware(config) : securityMiddleware
  
  return async (req: NextRequest): Promise<NextResponse> => {
    return middleware.apply(req, handler)
  }
}

// Export specific security checks
export const SecurityChecks = {
  validateCSRF: (req: NextRequest) => securityMiddleware['validateCSRF'](req),
  checkBruteForce: (req: NextRequest) => securityMiddleware['checkBruteForce'](req),
  recordAuthFailure: (req: NextRequest) => securityMiddleware.recordAuthFailure(req),
  clearAuthFailures: (req: NextRequest) => securityMiddleware.clearAuthFailures(req)
}

// Export configuration for customization
export { DEFAULT_SECURITY_CONFIG, type SecurityConfig }