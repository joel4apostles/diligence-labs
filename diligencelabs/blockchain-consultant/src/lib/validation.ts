import { z } from 'zod'

// Common validation schemas
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email()
export const urlSchema = z.string().url().optional()
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
})

// User validation schemas
export const userCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  password: z.string().min(8).max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER')
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  image: urlSchema
})

// Expert profile validation schemas
export const expertApplicationSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  position: z.string().min(1).max(200).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  bio: z.string().max(2000).optional(),
  primaryExpertise: z.array(z.string()).min(1).max(10),
  secondaryExpertise: z.array(z.string()).max(10).optional(),
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  twitterHandle: z.string().max(50).optional()
})

export const expertApprovalSchema = z.object({
  expertId: idSchema,
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_INFO']),
  reviewNotes: z.string().max(1000).optional()
})

// Project validation schemas
export const projectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  website: urlSchema,
  category: z.enum(['DEFI', 'NFT', 'GAMEFI', 'INFRASTRUCTURE', 'LAYER2', 'DAO', 'METAVERSE', 'SOCIAL', 'PRIVACY', 'LENDING']),
  foundingTeam: z.array(z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    experience: z.string().optional()
  })).optional(),
  teamSize: z.number().int().min(1).max(1000).optional(),
  blockchain: z.string().max(100).optional(),
  technologyStack: z.array(z.string()).optional(),
  repository: urlSchema,
  whitepaper: urlSchema,
  fundingRaised: z.number().min(0).optional(),
  userBase: z.number().int().min(0).optional(),
  monthlyRevenue: z.number().min(0).optional(),
  evaluationDeadline: z.string().datetime().optional(),
  priorityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  evaluationBudget: z.number().min(0).optional()
})

export const projectUpdateSchema = projectCreateSchema.partial()

// Project assignment validation schemas
export const projectAssignmentSchema = z.object({
  projectId: idSchema,
  assignmentType: z.enum(['PRIMARY', 'SECONDARY', 'REVIEWER']).default('PRIMARY'),
  estimatedHours: z.number().int().min(1).max(200).optional(),
  specialization: z.string().max(100).optional()
})

// Project evaluation validation schemas
export const projectEvaluationSchema = z.object({
  projectId: idSchema,
  teamScore: z.number().min(0).max(10).optional(),
  teamComments: z.string().max(1000).optional(),
  pmfScore: z.number().min(0).max(10).optional(),
  pmfComments: z.string().max(1000).optional(),
  infrastructureScore: z.number().min(0).max(10).optional(),
  infrastructureComments: z.string().max(1000).optional(),
  statusScore: z.number().min(0).max(10).optional(),
  statusComments: z.string().max(1000).optional(),
  competitiveScore: z.number().min(0).max(10).optional(),
  competitiveComments: z.string().max(1000).optional(),
  riskScore: z.number().min(0).max(10).optional(),
  riskComments: z.string().max(1000).optional(),
  overallScore: z.number().min(0).max(10).optional(),
  overallComments: z.string().max(1000).optional(),
  recommendation: z.enum(['STRONGLY_RECOMMEND', 'RECOMMEND', 'NEUTRAL', 'NOT_RECOMMEND', 'STRONGLY_NOT_RECOMMEND']).optional(),
  confidenceLevel: z.number().min(0).max(1).optional()
})

// Admin validation schemas
export const adminUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  permissions: z.array(z.string()).optional()
})

// Subscription validation schemas
export const subscriptionCreateSchema = z.object({
  planType: z.enum(['BASIC_MONTHLY', 'PROFESSIONAL_MONTHLY', 'ENTERPRISE_MONTHLY', 'VC_TIER_MONTHLY', 'ECOSYSTEM_PARTNER_MONTHLY']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY')
})

// Query parameter validation schemas
export const expertProjectsQuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
})

export const expertAssignmentsQuerySchema = z.object({
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ALL']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
})

export const adminExpertApplicationsQuerySchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'ALL']).default('PENDING'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
})

// Utility functions
export function validateAndParse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
    }
    throw error
  }
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input.trim())
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

export function validatePagination(query: URLSearchParams) {
  const page = Math.max(1, parseInt(query.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(query.get('limit') || '10')))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

// Rate limiting validation
export function parseRateLimitHeaders(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  
  return {
    ip,
    userAgent: request.headers.get('user-agent') || 'unknown',
    origin: request.headers.get('origin') || 'unknown'
  }
}