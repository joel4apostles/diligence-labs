import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimize Prisma client configuration for better performance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Pre-connect to database to avoid connection delay on first request
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  // Connect immediately in development
  prisma.$connect().catch(console.error)
}