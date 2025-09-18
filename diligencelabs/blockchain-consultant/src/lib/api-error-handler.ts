import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Log detailed error information for debugging
  if (error instanceof Error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: 'Validation failed',
      details: error.errors,
      code: 'VALIDATION_ERROR'
    }, { status: 400 })
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json({
          error: 'A record with this data already exists',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          field: error.meta?.target
        }, { status: 409 })
      
      case 'P2025':
        return NextResponse.json({
          error: 'Record not found',
          code: 'RECORD_NOT_FOUND'
        }, { status: 404 })
      
      case 'P2003':
        return NextResponse.json({
          error: 'Foreign key constraint failed',
          code: 'FOREIGN_KEY_CONSTRAINT',
          field: error.meta?.field_name
        }, { status: 400 })
      
      case 'P2014':
        return NextResponse.json({
          error: 'Invalid relation field',
          code: 'INVALID_RELATION'
        }, { status: 400 })
      
      default:
        return NextResponse.json({
          error: 'Database operation failed',
          code: error.code,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return NextResponse.json({
      error: 'Invalid data provided',
      code: 'PRISMA_VALIDATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 400 })
  }

  // Handle custom application errors
  if (error instanceof AuthenticationError) {
    return NextResponse.json({
      error: error.message,
      code: 'AUTHENTICATION_ERROR'
    }, { status: 401 })
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json({
      error: error.message,
      code: 'AUTHORIZATION_ERROR'
    }, { status: 403 })
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({
      error: error.message,
      code: 'NOT_FOUND'
    }, { status: 404 })
  }

  if (error instanceof ValidationError) {
    return NextResponse.json({
      error: error.message,
      code: 'VALIDATION_ERROR',
      details: error.details
    }, { status: 400 })
  }

  if (error instanceof ConflictError) {
    return NextResponse.json({
      error: error.message,
      code: 'CONFLICT_ERROR'
    }, { status: 409 })
  }

  if (error instanceof RateLimitError) {
    return NextResponse.json({
      error: error.message,
      code: 'RATE_LIMIT_ERROR'
    }, { status: 429 })
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('JWT')) {
      return NextResponse.json({
        error: 'Invalid or expired token',
        code: 'JWT_ERROR'
      }, { status: 401 })
    }

    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        code: 'CONNECTION_ERROR'
      }, { status: 503 })
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json({
        error: 'Request timeout',
        code: 'TIMEOUT_ERROR'
      }, { status: 504 })
    }
  }

  // Default error response
  return NextResponse.json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? 
      (error instanceof Error ? error.message : String(error)) : 
      'An unexpected error occurred'
  }, { status: 500 })
}

// Wrapper function for API routes
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Request validation helper
export function validateRequest(request: NextRequest, requiredFields: string[] = []) {
  const contentType = request.headers.get('content-type')
  
  if (request.method !== 'GET' && !contentType?.includes('application/json')) {
    throw new ValidationError('Content-Type must be application/json')
  }

  // Additional validation can be added here
  return true
}

// Response helpers
export class ApiResponse {
  static success<T>(data: T, message?: string, status = 200): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static error(message: string, code?: string, status = 400): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static paginated<T>(
    data: T[], 
    pagination: { page: number; limit: number; total: number; pages: number },
    message?: string
  ): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      pagination,
      message,
      timestamp: new Date().toISOString()
    })
  }
}

// Database transaction helper
export async function withTransaction<T>(
  operation: (prisma: any) => Promise<T>
): Promise<T> {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    return await prisma.$transaction(operation)
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}