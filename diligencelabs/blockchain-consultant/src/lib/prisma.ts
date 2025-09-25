import { PrismaClient } from '@prisma/client'
import { createEncryptionMiddleware } from './encrypted-fields'
import { logger } from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with enhanced configuration
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'minimal',
  })

  // For now, temporarily disable encryption middleware until we can properly configure it
  // This allows authentication to work while we implement the proper extension-based approach
  if (process.env.ENABLE_FIELD_ENCRYPTION === 'true') {
    logger.info('Field-level encryption is configured but temporarily disabled for compatibility')
    // TODO: Implement proper Prisma v5+ extension-based encryption middleware
  }

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Pre-connect to database to avoid connection delay on first request
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  // Connect immediately in development
  prisma.$connect().catch((error) => {
    logger.error('Failed to connect to database', {}, error)
  })
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  logger.info('Database connection closed')
})