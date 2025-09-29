import { PrismaClient } from '@prisma/client'
import { logger, LogCategory } from './advanced-logger'
import { cache, CacheKeys, CacheTTL } from './redis-cache'

interface QueryOptimizationConfig {
  enableQueryCaching: boolean
  enablePreloadStrategies: boolean
  enableQueryBatching: boolean
  slowQueryThreshold: number
  enableQueryPlan: boolean
}

const DEFAULT_CONFIG: QueryOptimizationConfig = {
  enableQueryCaching: true,
  enablePreloadStrategies: true,
  enableQueryBatching: true,
  slowQueryThreshold: 1000, // milliseconds
  enableQueryPlan: process.env.NODE_ENV === 'development'
}

class DatabaseOptimizer {
  private config: QueryOptimizationConfig
  private prisma: PrismaClient

  constructor(prisma: PrismaClient, config?: Partial<QueryOptimizationConfig>) {
    this.prisma = prisma
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Optimized user queries with caching and preloading
   */
  async getUserWithRelations(userId: string, includeExpertProfile = false) {
    const cacheKey = `${CacheKeys.user(userId)}:relations:${includeExpertProfile}`
    
    return cache.cacheQuery(
      cacheKey,
      async () => {
        const include: any = {
          subscription: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          userReputation: true,
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }

        if (includeExpertProfile) {
          include.expertProfile = {
            include: {
              achievements: {
                orderBy: { awardedAt: 'desc' },
                take: 5
              }
            }
          }
        }

        return this.prisma.user.findUnique({
          where: { id: userId },
          include
        })
      },
      { ttl: CacheTTL.MEDIUM }
    )
  }

  /**
   * Optimized expert queries with performance considerations
   */
  async getExpertDashboardData(expertId: string, page = 1, limit = 10) {
    // ExpertProfile model not implemented yet - return mock data
    return {
      expert: null,
      availableProjects: [],
      assignments: [],
      evaluations: [],
      stats: { totalProjects: 0, completedProjects: 0, averageRating: 0 }
    }
    
    /* TODO: Uncomment when ExpertProfile model is implemented
    const cacheKey = `expert:${expertId}:dashboard:${page}:${limit}`
    
    return cache.cacheQuery(
      cacheKey,
      async () => {
        // Use Promise.all to fetch data in parallel
        const [expert, availableProjects, assignments, evaluations, stats] = await Promise.all([
          // Expert profile with limited relations
          this.prisma.expertProfile.findUnique({
            where: { id: expertId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              },
              achievements: {
                orderBy: { awardedAt: 'desc' },
                take: 3
              }
            }
          }),

          // Available projects with optimized query
          this.getAvailableProjectsOptimized(page, limit),

          // Current assignments
          this.prisma.projectAssignment.findMany({
            where: { 
              expertId,
              status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
            },
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  priorityLevel: true,
                  evaluationBudget: true,
                  createdAt: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }),

          // Recent evaluations
          this.prisma.projectEvaluation.findMany({
            where: { expertId },
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            },
            orderBy: { submittedAt: 'desc' },
            take: 5
          }),

          // Performance stats
          this.getExpertStatsOptimized(expertId)
        ])

        return {
          expert,
          availableProjects,
          assignments,
          evaluations,
          stats
        }
      },
      { ttl: CacheTTL.SHORT }
    )
    */
  }

  /**
   * Optimized available projects query
   */
  private async getAvailableProjectsOptimized(page: number, limit: number) {
    // Project model not implemented yet - return empty array
    return []
    
    /* TODO: Uncomment when Project model is implemented
    const skip = (page - 1) * limit

    // Use cursor-based pagination for better performance on large datasets
    return this.prisma.project.findMany({
      where: {
        status: { in: ['EXPERT_ASSIGNMENT', 'EVALUATION_IN_PROGRESS'] },
        assignments: {
          // Only show projects with less than 3 assignments
          every: {
            NOT: {
              project: {
                assignments: {
                  // Count assignments per project efficiently
                  _count: {
                    gte: 3
                  }
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        priorityLevel: true,
        evaluationBudget: true,
        evaluationDeadline: true,
        createdAt: true,
        submitter: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            assignments: true,
            evaluations: true
          }
        }
      },
      orderBy: [
        { priorityLevel: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })
    */
  }

  /**
   * Optimized expert statistics calculation
   */
  private async getExpertStatsOptimized(expertId: string) {
    // Project assignment models not implemented yet - return mock stats
    return {
      totalProjects: 0,
      completedProjects: 0,
      averageRating: 0,
      totalHours: 0,
      reputationPoints: 0
    }
    
    /* TODO: Uncomment when ProjectAssignment and related models are implemented
    const cacheKey = CacheKeys.expertStats(expertId)
    
    return cache.cacheQuery(
      cacheKey,
      async () => {
        // Use aggregate queries for better performance
        const [assignmentStats, evaluationStats, reputationData] = await Promise.all([
          // Assignment statistics
          this.prisma.projectAssignment.aggregate({
            where: { expertId },
            _count: { id: true },
            _sum: { estimatedHours: true }
          }),

          // Evaluation statistics
          this.prisma.projectEvaluation.aggregate({
            where: { 
              expertId,
              status: 'APPROVED'
            },
            _count: { id: true },
            _avg: { 
              overallScore: true,
              confidenceLevel: true
            }
          }),

          // Reputation and tier info
          this.prisma.expertProfile.findUnique({
            where: { id: expertId },
            select: {
              reputationPoints: true,
              expertTier: true,
              totalEvaluations: true,
              accuracyRate: true,
              totalRewards: true
            }
          })
        ])

        return {
          totalAssignments: assignmentStats._count.id,
          estimatedHoursTotal: assignmentStats._sum.estimatedHours || 0,
          completedEvaluations: evaluationStats._count.id,
          averageScore: evaluationStats._avg.overallScore || 0,
          averageConfidence: evaluationStats._avg.confidenceLevel || 0,
          reputationPoints: reputationData?.reputationPoints || 0,
          expertTier: reputationData?.expertTier || 'BRONZE',
          totalEvaluations: reputationData?.totalEvaluations || 0,
          accuracyRate: reputationData?.accuracyRate || 0,
          totalRewards: reputationData?.totalRewards || 0
        }
      },
      { ttl: CacheTTL.LONG }
    )
    */
  }

  /**
   * Optimized admin dashboard queries
   */
  async getAdminDashboardData() {
    const cacheKey = 'admin:dashboard:overview'
    
    return cache.cacheQuery(
      cacheKey,
      async () => {
        // Use parallel queries for dashboard stats
        const [userStats, projectStats, expertStats, recentActivity] = await Promise.all([
          // User statistics
          this.prisma.user.aggregate({
            _count: { id: true }
          }),

          // Project statistics grouped by status (mock data - project model not implemented)
          Promise.resolve([
            { status: 'ACTIVE', _count: { id: 0 } },
            { status: 'COMPLETED', _count: { id: 0 } },
            { status: 'PENDING', _count: { id: 0 } }
          ]),

          // Expert verification status (mock data - expertProfile model not implemented)
          Promise.resolve([
            { verificationStatus: 'PENDING', _count: { id: 0 } },
            { verificationStatus: 'VERIFIED', _count: { id: 0 } },
            { verificationStatus: 'REJECTED', _count: { id: 0 } }
          ]),

          // Recent activity (last 24 hours)
          this.getRecentActivityOptimized()
        ])

        return {
          totalUsers: userStats._count.id,
          projectsByStatus: projectStats,
          expertsByStatus: expertStats,
          recentActivity
        }
      },
      { ttl: CacheTTL.MEDIUM }
    )
  }

  /**
   * Optimized recent activity query
   */
  private async getRecentActivityOptimized() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    return Promise.all([
      // New users
      this.prisma.user.count({
        where: { createdAt: { gte: yesterday } }
      }),

      // New projects (mock data - project model not implemented)
      Promise.resolve(0),

      // New expert applications (mock data - expertProfile model not implemented)
      Promise.resolve(0),

      // Completed evaluations (mock data - projectEvaluation model not implemented)
      Promise.resolve(0)
    ]).then(([newUsers, newProjects, newExperts, completedEvaluations]) => ({
      newUsers,
      newProjects,
      newExperts,
      completedEvaluations
    }))
  }

  /**
   * Batch operations for better performance
   */
  async updateMultipleReputations(updates: Array<{ userId: string; points: number }>) {
    if (!this.config.enableQueryBatching) {
      // Fallback to individual updates
      for (const update of updates) {
        await this.updateUserReputation(update.userId, update.points)
      }
      return
    }

    // TODO: Implement when reputationPoints field is added to User model
    console.warn('updateMultipleReputations called but reputationPoints field not implemented in User model')
    return []
    
    /* Uncomment when reputationPoints field is added to User model:
    // Use transaction for batch updates
    return this.prisma.$transaction(
      updates.map(update => 
        this.prisma.user.update({
          where: { id: update.userId },
          data: { 
            reputationPoints: { increment: update.points } 
          }
        })
      )
    )
    */
  }

  /**
   * Update user reputation with cache invalidation (disabled - reputationPoints field not in current schema)
   */
  async updateUserReputation(userId: string, points: number) {
    // TODO: Implement when reputationPoints field is added to User model
    console.warn('updateUserReputation called but reputationPoints field not implemented in User model')
    
    // Return a mock user object for now
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    return user
    
    /* Uncomment when reputationPoints field is added to User model:
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { reputationPoints: { increment: points } }
    })

    // Invalidate related caches
    await Promise.all([
      cache.del(CacheKeys.user(userId)),
      cache.del(CacheKeys.userReputation(userId)),
      cache.flush(`user:${userId}:*`)
    ])

    return result
    */
  }

  /**
   * Database health and performance monitoring
   */
  async getDatabaseHealth() {
    try {
      const start = Date.now()
      
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`
      
      const connectionTime = Date.now() - start

      // Get database size (PostgreSQL specific)
      let dbSize = 0
      try {
        const sizeResult = await this.prisma.$queryRaw<Array<{ size: bigint }>>`
          SELECT pg_database_size(current_database()) as size
        `
        dbSize = Number(sizeResult[0]?.size || 0)
      } catch (error) {
        // Ignore for non-PostgreSQL databases
      }

      // Get table statistics
      const tableStats = await this.getTableStatistics()

      return {
        status: 'healthy',
        connectionTime,
        databaseSize: dbSize,
        tableStatistics: tableStats,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      await logger.error(LogCategory.DATABASE, 'Database health check failed', error)
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get table statistics for monitoring
   */
  private async getTableStatistics() {
    const tables = [
      'users', 'projects', 'expert_profiles', 'project_evaluations',
      'project_assignments', 'subscriptions', 'user_activity_logs'
    ]

    const stats: Record<string, number> = {}

    for (const table of tables) {
      try {
        const model = (this.prisma as any)[this.camelCase(table)]
        if (model && model.count) {
          stats[table] = await model.count()
        }
      } catch (error) {
        stats[table] = 0
      }
    }

    return stats
  }

  /**
   * Query performance analyzer
   */
  async analyzeSlowQueries(minutes = 60) {
    if (!this.config.enableQueryPlan) {
      return { message: 'Query analysis disabled' }
    }

    try {
      // This would require PostgreSQL's pg_stat_statements extension
      const slowQueries = await this.prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE last_seen > NOW() - INTERVAL '${minutes} minutes'
        ORDER BY mean_time DESC 
        LIMIT 10
      ` as any[]

      await logger.info(LogCategory.DATABASE, `Found ${slowQueries.length} slow queries in last ${minutes} minutes`)
      
      return slowQueries
    } catch (error) {
      await logger.warn(LogCategory.DATABASE, 'Could not analyze slow queries', error instanceof Error ? { message: error.message, stack: error.stack } : { error })
      return []
    }
  }

  /**
   * Cache warm-up strategies
   */
  async warmUpCaches() {
    if (!this.config.enablePreloadStrategies) {
      return
    }

    await logger.info(LogCategory.PERFORMANCE, 'Starting cache warm-up')

    try {
      // Warm up common queries
      await Promise.all([
        // Cache subscription plans
        cache.cacheQuery(
          'subscription:plans:all',
          async () => {
            // This would cache subscription plan data
            return { plans: [] } // Placeholder
          },
          { ttl: CacheTTL.VERY_LONG }
        ),

        // Cache project categories (mock data - project model not implemented)
        cache.cacheQuery(
          'project:categories',
          async () => {
            return [
              { category: 'DEFI', _count: { category: 0 } },
              { category: 'NFT', _count: { category: 0 } },
              { category: 'GAMING', _count: { category: 0 } }
            ]
          },
          { ttl: CacheTTL.VERY_LONG }
        ),

        // Cache expert tiers distribution (mock data - expertProfile model not implemented)
        cache.cacheQuery(
          'experts:tier:distribution',
          async () => {
            return [
              { expertTier: 'JUNIOR', _count: { expertTier: 0 } },
              { expertTier: 'SENIOR', _count: { expertTier: 0 } },
              { expertTier: 'LEAD', _count: { expertTier: 0 } }
            ]
          },
          { ttl: CacheTTL.LONG }
        )
      ])

      await logger.info(LogCategory.PERFORMANCE, 'Cache warm-up completed')
    } catch (error) {
      await logger.error(LogCategory.PERFORMANCE, 'Cache warm-up failed', error)
    }
  }

  /**
   * Database maintenance operations
   */
  async performMaintenance() {
    await logger.info(LogCategory.DATABASE, 'Starting database maintenance')

    try {
      // Clean up expired sessions
      const expiredSessions = await this.prisma.session.deleteMany({
        where: {
          accountCreationExpiry: {
            lt: new Date()
          },
          userId: null // Only guest sessions
        }
      })

      // Clean up old activity logs (keep last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const oldLogs = await this.prisma.userActivityLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      })

      await logger.info(LogCategory.DATABASE, 'Database maintenance completed', {
        expiredSessionsDeleted: expiredSessions.count,
        oldLogsDeleted: oldLogs.count
      })

      return {
        expiredSessionsDeleted: expiredSessions.count,
        oldLogsDeleted: oldLogs.count
      }
    } catch (error) {
      await logger.error(LogCategory.DATABASE, 'Database maintenance failed', error)
      throw error
    }
  }

  private camelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/s$/, '') // Remove plural 's'
  }
}

// Export singleton with default Prisma client
let optimizerInstance: DatabaseOptimizer | null = null

export async function getDatabaseOptimizer(): Promise<DatabaseOptimizer> {
  if (!optimizerInstance) {
    const { getDatabase } = await import('./database')
    const prisma = await getDatabase()
    optimizerInstance = new DatabaseOptimizer(prisma)
  }
  return optimizerInstance
}

// Export specific optimized queries
export const OptimizedQueries = {
  getUserWithRelations: async (userId: string, includeExpertProfile = false) => {
    const optimizer = await getDatabaseOptimizer()
    return optimizer.getUserWithRelations(userId, includeExpertProfile)
  },

  getExpertDashboardData: async (expertId: string, page = 1, limit = 10) => {
    const optimizer = await getDatabaseOptimizer()
    return optimizer.getExpertDashboardData(expertId, page, limit)
  },

  getAdminDashboardData: async () => {
    const optimizer = await getDatabaseOptimizer()
    return optimizer.getAdminDashboardData()
  },

  updateUserReputation: async (userId: string, points: number) => {
    const optimizer = await getDatabaseOptimizer()
    return optimizer.updateUserReputation(userId, points)
  },

  performMaintenance: async () => {
    const optimizer = await getDatabaseOptimizer()
    return optimizer.performMaintenance()
  }
}

// Query performance monitoring
export async function monitorQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - start
    
    if (duration > DEFAULT_CONFIG.slowQueryThreshold) {
      await logger.warn(LogCategory.PERFORMANCE, `Slow query detected: ${queryName}`, {
        duration,
        threshold: DEFAULT_CONFIG.slowQueryThreshold
      })
    } else {
      await logger.debug(LogCategory.PERFORMANCE, `Query executed: ${queryName}`, { duration })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    await logger.error(LogCategory.DATABASE, `Query failed: ${queryName}`, error, { duration })
    throw error
  }
}

// Database indexes for better performance (to be applied via migrations)
export const RECOMMENDED_INDEXES = {
  // Composite indexes for common query patterns
  userEmailRole: 'CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);',
  userStatusCreated: 'CREATE INDEX IF NOT EXISTS idx_users_status_created ON users(account_status, created_at);',
  projectStatusCategory: 'CREATE INDEX IF NOT EXISTS idx_projects_status_category ON projects(status, category);',
  expertVerificationTier: 'CREATE INDEX IF NOT EXISTS idx_experts_verification_tier ON expert_profiles(verification_status, expert_tier);',
  evaluationStatusSubmitted: 'CREATE INDEX IF NOT EXISTS idx_evaluations_status_submitted ON project_evaluations(status, submitted_at);',
  
  // Partial indexes for common filtered queries
  activeSubscriptions: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id) WHERE status = \'ACTIVE\';',
  pendingExperts: 'CREATE INDEX IF NOT EXISTS idx_experts_pending ON expert_profiles(created_at) WHERE verification_status = \'PENDING\';',
  availableProjects: 'CREATE INDEX IF NOT EXISTS idx_projects_available ON projects(priority_level, created_at) WHERE status IN (\'EXPERT_ASSIGNMENT\', \'EVALUATION_IN_PROGRESS\');',
  
  // Full-text search indexes (PostgreSQL)
  projectSearch: 'CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(to_tsvector(\'english\', name || \' \' || description));',
  expertSearch: 'CREATE INDEX IF NOT EXISTS idx_experts_search ON expert_profiles USING GIN(to_tsvector(\'english\', COALESCE(bio, \'\') || \' \' || COALESCE(company, \'\')));'
}

// Export maintenance scheduler
export async function scheduleDatabaseMaintenance() {
  // This would typically be called by a cron job
  const optimizer = await getDatabaseOptimizer()
  
  try {
    await optimizer.performMaintenance()
    await optimizer.warmUpCaches()
    
    const health = await optimizer.getDatabaseHealth()
    await logger.info(LogCategory.DATABASE, 'Scheduled maintenance completed', health)
    
    return health
  } catch (error) {
    await logger.error(LogCategory.DATABASE, 'Scheduled maintenance failed', error)
    throw error
  }
}