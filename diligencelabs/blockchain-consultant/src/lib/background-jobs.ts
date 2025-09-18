import { logger, LogCategory } from './advanced-logger'
import { cache } from './redis-cache'
import { getDatabase } from './database'
import { sendEmail } from './email'

interface Job {
  id: string
  type: JobType
  data: any
  priority: JobPriority
  attempts: number
  maxAttempts: number
  delay: number
  createdAt: Date
  scheduledFor: Date
  processedAt?: Date
  completedAt?: Date
  failedAt?: Date
  error?: string
  result?: any
}

interface JobProcessor<T = any> {
  process: (data: T, job: Job) => Promise<any>
  onSuccess?: (result: any, job: Job) => Promise<void>
  onFailure?: (error: Error, job: Job) => Promise<void>
  maxRetries?: number
  retryDelay?: number
}

enum JobType {
  // Email jobs
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_BULK_EMAIL = 'SEND_BULK_EMAIL',
  
  // Notification jobs
  EXPERT_APPROVAL_NOTIFICATION = 'EXPERT_APPROVAL_NOTIFICATION',
  PROJECT_ASSIGNMENT_NOTIFICATION = 'PROJECT_ASSIGNMENT_NOTIFICATION',
  EVALUATION_REMINDER = 'EVALUATION_REMINDER',
  
  // Data processing jobs
  UPDATE_REPUTATION_POINTS = 'UPDATE_REPUTATION_POINTS',
  CALCULATE_EXPERT_STATS = 'CALCULATE_EXPERT_STATS',
  GENERATE_PROJECT_REPORT = 'GENERATE_PROJECT_REPORT',
  
  // Cleanup jobs
  CLEANUP_EXPIRED_SESSIONS = 'CLEANUP_EXPIRED_SESSIONS',
  CLEANUP_OLD_LOGS = 'CLEANUP_OLD_LOGS',
  CACHE_WARMUP = 'CACHE_WARMUP',
  
  // Payment processing
  PROCESS_REWARD_DISTRIBUTION = 'PROCESS_REWARD_DISTRIBUTION',
  PROCESS_SUBSCRIPTION_PAYMENT = 'PROCESS_SUBSCRIPTION_PAYMENT',
  
  // Analytics
  GENERATE_ANALYTICS_REPORT = 'GENERATE_ANALYTICS_REPORT',
  UPDATE_LEADERBOARDS = 'UPDATE_LEADERBOARDS'
}

enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15
}

enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  CANCELLED = 'CANCELLED'
}

class BackgroundJobProcessor {
  private processors = new Map<JobType, JobProcessor>()
  private queue: Job[] = []
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null
  private maxConcurrentJobs = parseInt(process.env.MAX_CONCURRENT_JOBS || '5')
  private currentlyProcessing = new Set<string>()

  constructor() {
    this.registerDefaultProcessors()
    this.startProcessing()
  }

  /**
   * Register job processors
   */
  private registerDefaultProcessors() {
    // Email processors
    this.registerProcessor(JobType.SEND_EMAIL, {
      process: async (data) => {
        const { to, subject, html, text, from } = data
        return sendEmail({ to, subject, html, text, from })
      },
      maxRetries: 3,
      retryDelay: 60000 // 1 minute
    })

    this.registerProcessor(JobType.SEND_BULK_EMAIL, {
      process: async (data) => {
        const { recipients, subject, html, text, from } = data
        const results = []
        
        for (const recipient of recipients) {
          try {
            const result = await sendEmail({ to: recipient, subject, html, text, from })
            results.push({ recipient, success: true, result })
          } catch (error) {
            results.push({ recipient, success: false, error: error instanceof Error ? error.message : String(error) })
          }
        }
        
        return results
      },
      maxRetries: 2,
      retryDelay: 300000 // 5 minutes
    })

    // Notification processors
    this.registerProcessor(JobType.EXPERT_APPROVAL_NOTIFICATION, {
      process: async (data) => {
        const { expertId, status, reviewNotes } = data
        const db = await getDatabase()
        
        const expert = await db.expertProfile.findUnique({
          where: { id: expertId },
          include: { user: true }
        })

        if (!expert?.user.email) {
          throw new Error('Expert email not found')
        }

        const subject = status === 'VERIFIED' ? 
          'Expert Application Approved! 🎉' : 
          'Expert Application Status Update'
        
        const html = this.generateExpertNotificationEmail(expert, status, reviewNotes)
        
        return sendEmail({
          to: expert.user.email,
          subject,
          html
        })
      },
      maxRetries: 3
    })

    // Data processing processors
    this.registerProcessor(JobType.UPDATE_REPUTATION_POINTS, {
      process: async (data) => {
        const { userId, points, reason } = data
        const db = await getDatabase()
        
        const result = await db.user.update({
          where: { id: userId },
          data: { 
            reputationPoints: { increment: points }
          },
          include: {
            userReputation: true
          }
        })

        // Log reputation update
        await logger.info(LogCategory.USER_ACTION, `Reputation updated: ${userId}`, {
          points,
          reason,
          newTotal: result.reputationPoints
        })

        // Invalidate cache
        await cache.del(`user:${userId}`)
        await cache.del(`user:${userId}:reputation`)

        return result
      }
    })

    this.registerProcessor(JobType.CALCULATE_EXPERT_STATS, {
      process: async (data) => {
        const { expertId } = data
        const db = await getDatabase()
        
        // Calculate expert statistics
        const [evaluationStats, assignmentStats] = await Promise.all([
          db.projectEvaluation.aggregate({
            where: { expertId, status: 'APPROVED' },
            _count: { id: true },
            _avg: { 
              overallScore: true,
              confidenceLevel: true
            }
          }),
          db.projectAssignment.aggregate({
            where: { expertId, status: 'COMPLETED' },
            _count: { id: true }
          })
        ])

        // Update expert profile
        const updated = await db.expertProfile.update({
          where: { id: expertId },
          data: {
            totalEvaluations: evaluationStats._count.id,
            averageRating: evaluationStats._avg.overallScore || 0,
            accuracyRate: evaluationStats._avg.confidenceLevel || 0
          }
        })

        // Invalidate cache
        await cache.del(`expert:${expertId}`)
        await cache.del(`expert:${expertId}:stats`)

        return updated
      }
    })

    // Cleanup processors
    this.registerProcessor(JobType.CLEANUP_EXPIRED_SESSIONS, {
      process: async () => {
        const db = await getDatabase()
        
        const result = await db.session.deleteMany({
          where: {
            accountCreationExpiry: {
              lt: new Date()
            },
            userId: null
          }
        })

        await logger.info(LogCategory.SYSTEM, `Cleaned up ${result.count} expired sessions`)
        return result
      }
    })

    this.registerProcessor(JobType.CLEANUP_OLD_LOGS, {
      process: async (data) => {
        const { daysToKeep = 30 } = data
        const db = await getDatabase()
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
        
        const result = await db.userActivityLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate
            }
          }
        })

        await logger.info(LogCategory.SYSTEM, `Cleaned up ${result.count} old activity logs`)
        return result
      }
    })

    // Cache warmup
    this.registerProcessor(JobType.CACHE_WARMUP, {
      process: async () => {
        const { getDatabaseOptimizer } = await import('./database-optimization')
        const optimizer = await getDatabaseOptimizer()
        await optimizer.warmUpCaches()
        return { success: true }
      }
    })

    // Leaderboard updates
    this.registerProcessor(JobType.UPDATE_LEADERBOARDS, {
      process: async () => {
        const db = await getDatabase()
        
        // Update expert leaderboard
        const topExperts = await db.expertProfile.findMany({
          where: { verificationStatus: 'VERIFIED' },
          orderBy: { reputationPoints: 'desc' },
          take: 100,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        })

        // Cache leaderboard data
        await cache.set('leaderboard:experts:top100', topExperts, { ttl: 3600 }) // 1 hour

        // Update user leaderboard
        const topUsers = await db.user.findMany({
          orderBy: { reputationPoints: 'desc' },
          take: 100,
          select: {
            id: true,
            name: true,
            image: true,
            reputationPoints: true,
            submitterTier: true,
            totalProjectsSubmitted: true
          }
        })

        await cache.set('leaderboard:users:top100', topUsers, { ttl: 3600 })

        return { expertsCount: topExperts.length, usersCount: topUsers.length }
      }
    })
  }

  /**
   * Register a job processor
   */
  registerProcessor<T = any>(type: JobType, processor: JobProcessor<T>) {
    this.processors.set(type, processor)
    logger.info(LogCategory.SYSTEM, `Job processor registered: ${type}`)
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    type: JobType,
    data: any,
    options: {
      priority?: JobPriority
      delay?: number
      maxAttempts?: number
      scheduledFor?: Date
    } = {}
  ): Promise<string> {
    const jobId = this.generateJobId()
    const now = new Date()
    
    const job: Job = {
      id: jobId,
      type,
      data,
      priority: options.priority || JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      delay: options.delay || 0,
      createdAt: now,
      scheduledFor: options.scheduledFor || (options.delay ? new Date(now.getTime() + options.delay) : now)
    }

    // Store job in memory queue (in production, use Redis or database)
    this.queue.push(job)
    this.sortQueue()

    // Also store in Redis for persistence
    await this.persistJob(job)

    await logger.info(LogCategory.SYSTEM, `Job added to queue: ${type}`, {
      jobId,
      priority: job.priority,
      scheduledFor: job.scheduledFor
    })

    return jobId
  }

  /**
   * Process jobs in the queue
   */
  private async processJobs() {
    if (this.currentlyProcessing.size >= this.maxConcurrentJobs) {
      return // Already at max capacity
    }

    const now = new Date()
    const readyJobs = this.queue.filter(job => 
      job.scheduledFor <= now && 
      !this.currentlyProcessing.has(job.id) &&
      job.attempts < job.maxAttempts
    )

    if (readyJobs.length === 0) {
      return
    }

    // Process jobs up to the concurrent limit
    const jobsToProcess = readyJobs.slice(0, this.maxConcurrentJobs - this.currentlyProcessing.size)
    
    for (const job of jobsToProcess) {
      this.processJob(job) // Don't await, process concurrently
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job) {
    this.currentlyProcessing.add(job.id)
    job.attempts++
    job.processedAt = new Date()

    await logger.info(LogCategory.SYSTEM, `Processing job: ${job.type}`, {
      jobId: job.id,
      attempt: job.attempts
    })

    try {
      const processor = this.processors.get(job.type)
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.type}`)
      }

      const result = await processor.process(job.data, job)
      
      // Job completed successfully
      job.result = result
      job.completedAt = new Date()
      
      await logger.info(LogCategory.SYSTEM, `Job completed: ${job.type}`, {
        jobId: job.id,
        duration: job.completedAt.getTime() - job.processedAt!.getTime()
      })

      // Call success handler if provided
      if (processor.onSuccess) {
        await processor.onSuccess(result, job)
      }

      // Remove from queue
      this.removeJobFromQueue(job.id)
      await this.removePersistedJob(job.id)

    } catch (error) {
      const err = error as Error
      job.error = err.message
      job.failedAt = new Date()

      await logger.error(LogCategory.SYSTEM, `Job failed: ${job.type}`, error, {
        jobId: job.id,
        attempt: job.attempts,
        maxAttempts: job.maxAttempts
      })

      const processor = this.processors.get(job.type)
      
      // Check if we should retry
      if (job.attempts < job.maxAttempts) {
        // Schedule retry with exponential backoff
        const retryDelay = (processor?.retryDelay || 60000) * Math.pow(2, job.attempts - 1)
        job.scheduledFor = new Date(Date.now() + retryDelay)
        
        await logger.info(LogCategory.SYSTEM, `Job scheduled for retry: ${job.type}`, {
          jobId: job.id,
          retryIn: retryDelay,
          nextAttempt: job.attempts + 1
        })
        
        await this.persistJob(job)
      } else {
        // Max attempts reached, call failure handler
        await logger.error(LogCategory.SYSTEM, `Job permanently failed: ${job.type}`, error, {
          jobId: job.id,
          totalAttempts: job.attempts
        })

        if (processor?.onFailure) {
          try {
            await processor.onFailure(err, job)
          } catch (handlerError) {
            await logger.error(LogCategory.SYSTEM, 'Job failure handler failed', handlerError)
          }
        }

        // Remove from queue
        this.removeJobFromQueue(job.id)
        await this.removePersistedJob(job.id)
      }
    } finally {
      this.currentlyProcessing.delete(job.id)
    }
  }

  /**
   * Start job processing
   */
  private startProcessing() {
    if (this.processingInterval) {
      return
    }

    // Process jobs every 5 seconds
    this.processingInterval = setInterval(async () => {
      try {
        await this.processJobs()
      } catch (error) {
        await logger.error(LogCategory.SYSTEM, 'Error in job processing cycle', error)
      }
    }, 5000)

    logger.info(LogCategory.SYSTEM, 'Background job processor started')
  }

  /**
   * Stop job processing
   */
  async stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    // Wait for currently processing jobs to finish
    while (this.currentlyProcessing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    logger.info(LogCategory.SYSTEM, 'Background job processor stopped')
  }

  /**
   * Get job statistics
   */
  getStats() {
    const now = new Date()
    const stats = {
      totalJobs: this.queue.length,
      readyJobs: this.queue.filter(job => job.scheduledFor <= now && job.attempts < job.maxAttempts).length,
      processingJobs: this.currentlyProcessing.size,
      failedJobs: this.queue.filter(job => job.attempts >= job.maxAttempts).length,
      scheduledJobs: this.queue.filter(job => job.scheduledFor > now).length,
      jobsByType: this.getJobsByType(),
      jobsByPriority: this.getJobsByPriority()
    }

    return stats
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      // Sort by priority (higher first), then by scheduled time
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.scheduledFor.getTime() - b.scheduledFor.getTime()
    })
  }

  private removeJobFromQueue(jobId: string) {
    this.queue = this.queue.filter(job => job.id !== jobId)
  }

  private async persistJob(job: Job) {
    try {
      await cache.set(`job:${job.id}`, job, { ttl: 86400 }) // 24 hours
    } catch (error) {
      await logger.warn(LogCategory.SYSTEM, 'Failed to persist job', error)
    }
  }

  private async removePersistedJob(jobId: string) {
    try {
      await cache.del(`job:${jobId}`)
    } catch (error) {
      await logger.warn(LogCategory.SYSTEM, 'Failed to remove persisted job', error)
    }
  }

  private getJobsByType() {
    const jobsByType: Record<string, number> = {}
    for (const job of this.queue) {
      jobsByType[job.type] = (jobsByType[job.type] || 0) + 1
    }
    return jobsByType
  }

  private getJobsByPriority() {
    const jobsByPriority: Record<string, number> = {}
    for (const job of this.queue) {
      const priority = JobPriority[job.priority] || 'UNKNOWN'
      jobsByPriority[priority] = (jobsByPriority[priority] || 0) + 1
    }
    return jobsByPriority
  }

  private generateExpertNotificationEmail(expert: any, status: string, reviewNotes?: string) {
    const isApproved = status === 'VERIFIED'
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${isApproved ? '#10B981' : '#F59E0B'};">
          ${isApproved ? '🎉 Congratulations!' : '📋 Application Update'}
        </h1>
        
        <p>Dear ${expert.user.name},</p>
        
        ${isApproved ? 
          '<p>Your expert application has been <strong>approved</strong>! Welcome to our platform.</p>' :
          '<p>Your expert application status has been updated.</p>'
        }
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Application Status: <span style="color: ${isApproved ? '#10B981' : '#F59E0B'};">${status}</span></h3>
          ${reviewNotes ? `<p><strong>Review Notes:</strong> ${reviewNotes}</p>` : ''}
        </div>
        
        ${isApproved ? `
          <p>You can now:</p>
          <ul>
            <li>View available projects for evaluation</li>
            <li>Assign yourself to projects</li>
            <li>Start earning reputation points and rewards</li>
          </ul>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/expert" 
             style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Access Expert Dashboard
          </a>
        ` : `
          <p>Please review the feedback above and feel free to contact us if you have any questions.</p>
        `}
        
        <p>Best regards,<br>The Blockchain Advisory Team</p>
      </div>
    `
  }
}

// Export singleton instance
export const jobProcessor = new BackgroundJobProcessor()

// Export convenience functions
export const JobUtils = {
  // Schedule email jobs
  sendEmail: async (emailData: any, options = {}) => {
    return jobProcessor.addJob(JobType.SEND_EMAIL, emailData, {
      priority: JobPriority.HIGH,
      ...options
    })
  },

  sendBulkEmail: async (bulkEmailData: any, options = {}) => {
    return jobProcessor.addJob(JobType.SEND_BULK_EMAIL, bulkEmailData, {
      priority: JobPriority.NORMAL,
      ...options
    })
  },

  // Schedule notification jobs
  notifyExpertApproval: async (expertId: string, status: string, reviewNotes?: string) => {
    return jobProcessor.addJob(JobType.EXPERT_APPROVAL_NOTIFICATION, {
      expertId,
      status,
      reviewNotes
    }, {
      priority: JobPriority.HIGH
    })
  },

  // Schedule data processing jobs
  updateReputationPoints: async (userId: string, points: number, reason: string) => {
    return jobProcessor.addJob(JobType.UPDATE_REPUTATION_POINTS, {
      userId,
      points,
      reason
    }, {
      priority: JobPriority.NORMAL
    })
  },

  calculateExpertStats: async (expertId: string) => {
    return jobProcessor.addJob(JobType.CALCULATE_EXPERT_STATS, {
      expertId
    }, {
      priority: JobPriority.LOW
    })
  },

  // Schedule cleanup jobs
  cleanupExpiredSessions: async () => {
    return jobProcessor.addJob(JobType.CLEANUP_EXPIRED_SESSIONS, {}, {
      priority: JobPriority.LOW
    })
  },

  cleanupOldLogs: async (daysToKeep = 30) => {
    return jobProcessor.addJob(JobType.CLEANUP_OLD_LOGS, {
      daysToKeep
    }, {
      priority: JobPriority.LOW
    })
  },

  // Schedule cache warmup
  warmupCache: async () => {
    return jobProcessor.addJob(JobType.CACHE_WARMUP, {}, {
      priority: JobPriority.LOW
    })
  },

  // Schedule leaderboard updates
  updateLeaderboards: async () => {
    return jobProcessor.addJob(JobType.UPDATE_LEADERBOARDS, {}, {
      priority: JobPriority.NORMAL
    })
  }
}

// Export scheduled job functions for cron jobs
export const ScheduledJobs = {
  // Run daily maintenance
  dailyMaintenance: async () => {
    const jobs = await Promise.all([
      JobUtils.cleanupExpiredSessions(),
      JobUtils.cleanupOldLogs(),
      JobUtils.updateLeaderboards(),
      JobUtils.warmupCache()
    ])
    
    await logger.info(LogCategory.SYSTEM, 'Daily maintenance jobs scheduled', {
      jobIds: jobs
    })
    
    return jobs
  },

  // Run hourly updates
  hourlyUpdates: async () => {
    const jobs = await Promise.all([
      JobUtils.updateLeaderboards()
    ])
    
    return jobs
  }
}

// Export job types and priorities for external use
export { JobType, JobPriority, JobStatus }

// Graceful shutdown
export async function gracefulShutdown() {
  await logger.info(LogCategory.SYSTEM, 'Shutting down background job processor')
  await jobProcessor.stop()
}