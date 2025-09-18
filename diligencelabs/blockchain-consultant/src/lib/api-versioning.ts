import { NextRequest, NextResponse } from 'next/server'
import { logger, LogCategory } from './advanced-logger'

export type ApiVersion = 'v1' | 'v2'

export interface VersionConfig {
  version: ApiVersion
  deprecated?: boolean
  deprecationDate?: string
  sunsetDate?: string
  supportedUntil?: string
}

export interface ApiVersionInfo {
  current: ApiVersion
  supported: ApiVersion[]
  deprecated: ApiVersion[]
  latest: ApiVersion
}

// API Version configuration
export const API_VERSIONS: Record<ApiVersion, VersionConfig> = {
  v1: {
    version: 'v1',
    deprecated: false,
    supportedUntil: '2025-12-31'
  },
  v2: {
    version: 'v2',
    deprecated: false
  }
}

export const API_VERSION_INFO: ApiVersionInfo = {
  current: 'v2',
  supported: ['v1', 'v2'],
  deprecated: [],
  latest: 'v2'
}

export class ApiVersionManager {
  private static readonly HEADER_NAME = 'X-API-Version'
  private static readonly ACCEPT_VERSION_HEADER = 'Accept-Version'
  
  /**
   * Extract API version from request
   */
  static getVersionFromRequest(req: NextRequest): ApiVersion {
    // Check URL path first (/api/v1/..., /api/v2/...)
    const pathMatch = req.nextUrl.pathname.match(/\/api\/v(\d+)\//)
    if (pathMatch) {
      const version = `v${pathMatch[1]}` as ApiVersion
      if (API_VERSION_INFO.supported.includes(version)) {
        return version
      }
    }

    // Check headers
    const headerVersion = req.headers.get(this.HEADER_NAME) || 
                         req.headers.get(this.ACCEPT_VERSION_HEADER)
    
    if (headerVersion && API_VERSION_INFO.supported.includes(headerVersion as ApiVersion)) {
      return headerVersion as ApiVersion
    }

    // Check query parameter
    const queryVersion = req.nextUrl.searchParams.get('version')
    if (queryVersion && API_VERSION_INFO.supported.includes(queryVersion as ApiVersion)) {
      return queryVersion as ApiVersion
    }

    // Default to current version
    return API_VERSION_INFO.current
  }

  /**
   * Add version headers to response
   */
  static addVersionHeaders(response: NextResponse, version: ApiVersion): NextResponse {
    response.headers.set(this.HEADER_NAME, version)
    response.headers.set('X-API-Supported-Versions', API_VERSION_INFO.supported.join(', '))
    response.headers.set('X-API-Latest-Version', API_VERSION_INFO.latest)
    
    // Add deprecation warning if applicable
    const versionConfig = API_VERSIONS[version]
    if (versionConfig.deprecated) {
      response.headers.set('Deprecation', 'true')
      if (versionConfig.sunsetDate) {
        response.headers.set('Sunset', versionConfig.sunsetDate)
      }
      response.headers.set('Link', `</api/${API_VERSION_INFO.latest}>; rel="successor-version"`)
    }

    return response
  }

  /**
   * Check if version is supported
   */
  static isVersionSupported(version: string): boolean {
    return API_VERSION_INFO.supported.includes(version as ApiVersion)
  }

  /**
   * Check if version is deprecated
   */
  static isVersionDeprecated(version: ApiVersion): boolean {
    return API_VERSION_INFO.deprecated.includes(version) || 
           API_VERSIONS[version]?.deprecated === true
  }

  /**
   * Get version-specific response format
   */
  static formatResponse<T>(data: T, version: ApiVersion, meta?: any): any {
    const baseResponse = {
      success: true,
      data,
      version,
      timestamp: new Date().toISOString()
    }

    switch (version) {
      case 'v1':
        // V1 format - simpler structure
        return {
          ...baseResponse,
          ...meta
        }
      
      case 'v2':
        // V2 format - more structured with meta wrapper
        return {
          ...baseResponse,
          meta: {
            version,
            ...meta
          }
        }
      
      default:
        return baseResponse
    }
  }

  /**
   * Create version-specific error response
   */
  static formatErrorResponse(error: string, code?: string, version?: ApiVersion, status = 400): NextResponse {
    const apiVersion = version || API_VERSION_INFO.current
    
    let errorResponse: any
    
    switch (apiVersion) {
      case 'v1':
        errorResponse = {
          error: true,
          message: error,
          code,
          timestamp: new Date().toISOString()
        }
        break
      
      case 'v2':
        errorResponse = {
          success: false,
          error: {
            message: error,
            code,
            timestamp: new Date().toISOString()
          },
          version: apiVersion
        }
        break
      
      default:
        errorResponse = {
          success: false,
          error,
          code,
          version: apiVersion,
          timestamp: new Date().toISOString()
        }
    }

    const response = NextResponse.json(errorResponse, { status })
    return this.addVersionHeaders(response, apiVersion)
  }
}

/**
 * Middleware wrapper for API versioning
 */
export function withApiVersioning<T extends any[]>(
  handlers: Partial<Record<ApiVersion, (...args: T) => Promise<NextResponse>>>
) {
  return async (...args: T): Promise<NextResponse> => {
    const req = args[0] as NextRequest
    const version = ApiVersionManager.getVersionFromRequest(req)
    
    // Log API version usage
    await logger.info(LogCategory.API, `API ${version} request`, {
      path: req.nextUrl.pathname,
      method: req.method,
      version,
      userAgent: req.headers.get('user-agent')
    })

    // Check if version is supported
    if (!ApiVersionManager.isVersionSupported(version)) {
      return ApiVersionManager.formatErrorResponse(
        `API version ${version} is not supported. Supported versions: ${API_VERSION_INFO.supported.join(', ')}`,
        'UNSUPPORTED_VERSION',
        version,
        400
      )
    }

    // Get handler for the version
    const handler = handlers[version]
    
    if (!handler) {
      // Fallback to latest version if handler not found
      const fallbackHandler = handlers[API_VERSION_INFO.latest]
      if (fallbackHandler) {
        await logger.warn(LogCategory.API, `No handler for ${version}, falling back to ${API_VERSION_INFO.latest}`, {
          path: req.nextUrl.pathname,
          requestedVersion: version,
          fallbackVersion: API_VERSION_INFO.latest
        })
        
        const response = await fallbackHandler(...args)
        return ApiVersionManager.addVersionHeaders(response, API_VERSION_INFO.latest)
      }

      return ApiVersionManager.formatErrorResponse(
        `Handler not implemented for API version ${version}`,
        'HANDLER_NOT_FOUND',
        version,
        501
      )
    }

    // Execute version-specific handler
    try {
      const response = await handler(...args)
      
      // Add deprecation warning if needed
      if (ApiVersionManager.isVersionDeprecated(version)) {
        await logger.warn(LogCategory.API, `Deprecated API version ${version} used`, {
          path: req.nextUrl.pathname,
          method: req.method,
          version,
          userAgent: req.headers.get('user-agent')
        })
      }

      return ApiVersionManager.addVersionHeaders(response, version)
    } catch (error) {
      await logger.error(LogCategory.API, `Error in ${version} handler`, error, {
        path: req.nextUrl.pathname,
        method: req.method,
        version
      })
      throw error
    }
  }
}

/**
 * Helper for creating version-aware API responses
 */
export function createVersionedResponse<T>(
  data: T,
  version: ApiVersion,
  meta?: any,
  status = 200
): NextResponse {
  const formattedData = ApiVersionManager.formatResponse(data, version, meta)
  const response = NextResponse.json(formattedData, { status })
  return ApiVersionManager.addVersionHeaders(response, version)
}

/**
 * Migration helper to transform data between versions
 */
export class DataTransformer {
  /**
   * Transform user data for different API versions
   */
  static transformUser(userData: any, version: ApiVersion): any {
    switch (version) {
      case 'v1':
        // V1 - simpler user object
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt
        }
      
      case 'v2':
        // V2 - enhanced user object with relationships
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          image: userData.image,
          role: userData.role,
          reputationPoints: userData.reputationPoints,
          subscription: userData.subscription,
          expertProfile: userData.expertProfile,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        }
      
      default:
        return userData
    }
  }

  /**
   * Transform project data for different API versions
   */
  static transformProject(projectData: any, version: ApiVersion): any {
    switch (version) {
      case 'v1':
        // V1 - basic project info
        return {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description,
          category: projectData.category,
          status: projectData.status,
          createdAt: projectData.createdAt
        }
      
      case 'v2':
        // V2 - full project details with relationships
        return {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description,
          website: projectData.website,
          category: projectData.category,
          status: projectData.status,
          priorityLevel: projectData.priorityLevel,
          evaluationBudget: projectData.evaluationBudget,
          submitter: projectData.submitter,
          assignments: projectData.assignments,
          evaluations: projectData.evaluations,
          assignmentCount: projectData._count?.assignments || 0,
          evaluationCount: projectData._count?.evaluations || 0,
          createdAt: projectData.createdAt,
          updatedAt: projectData.updatedAt
        }
      
      default:
        return projectData
    }
  }

  /**
   * Transform expert profile data
   */
  static transformExpertProfile(expertData: any, version: ApiVersion): any {
    switch (version) {
      case 'v1':
        return {
          id: expertData.id,
          userId: expertData.userId,
          verificationStatus: expertData.verificationStatus,
          company: expertData.company,
          primaryExpertise: expertData.primaryExpertise
        }
      
      case 'v2':
        return {
          id: expertData.id,
          userId: expertData.userId,
          verificationStatus: expertData.verificationStatus,
          expertTier: expertData.expertTier,
          company: expertData.company,
          position: expertData.position,
          yearsExperience: expertData.yearsExperience,
          bio: expertData.bio,
          primaryExpertise: expertData.primaryExpertise,
          secondaryExpertise: expertData.secondaryExpertise,
          reputationPoints: expertData.reputationPoints,
          totalEvaluations: expertData.totalEvaluations,
          successfulEvaluations: expertData.successfulEvaluations,
          linkedinUrl: expertData.linkedinUrl,
          githubUrl: expertData.githubUrl,
          twitterHandle: expertData.twitterHandle,
          user: expertData.user,
          assignments: expertData.assignments,
          evaluations: expertData.evaluations,
          achievements: expertData.achievements,
          createdAt: expertData.createdAt,
          updatedAt: expertData.updatedAt
        }
      
      default:
        return expertData
    }
  }
}

/**
 * Version compatibility checker
 */
export function checkVersionCompatibility(
  requiredVersion: ApiVersion,
  currentVersion: ApiVersion
): boolean {
  const versionOrder: ApiVersion[] = ['v1', 'v2']
  const requiredIndex = versionOrder.indexOf(requiredVersion)
  const currentIndex = versionOrder.indexOf(currentVersion)
  
  // Current version must be >= required version
  return currentIndex >= requiredIndex
}

/**
 * Generate API documentation info
 */
export function getApiDocumentationInfo() {
  return {
    versions: API_VERSION_INFO,
    configurations: API_VERSIONS,
    endpoints: {
      v1: {
        baseUrl: '/api/v1',
        documentation: '/api/v1/docs'
      },
      v2: {
        baseUrl: '/api/v2',
        documentation: '/api/v2/docs'
      }
    },
    headers: {
      version: ApiVersionManager['HEADER_NAME'],
      acceptVersion: ApiVersionManager['ACCEPT_VERSION_HEADER']
    }
  }
}