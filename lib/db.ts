import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // For PostgreSQL (production on Vercel and recommended for local)
  // DATABASE_URL should be a PostgreSQL connection string like:
  // postgresql://user:password@host:port/database
  // Prisma will automatically use DATABASE_URL from environment variables
  
  // Check if DATABASE_URL is set before creating PrismaClient
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl || databaseUrl === '') {
    throw new Error('DATABASE_URL is not set. PrismaClient cannot be initialized without a database URL.')
  }

  // For Prisma 7 with PostgreSQL, we need to ensure DATABASE_URL is available
  // Prisma automatically reads DATABASE_URL from environment variables
  // No adapter or accelerateUrl needed for standard PostgreSQL connections
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  } catch (error) {
    // If PrismaClient creation fails, provide a more helpful error
    if (error instanceof Error && error.message.includes('adapter') || error.message.includes('accelerateUrl')) {
      throw new Error(
        `PrismaClient initialization failed. DATABASE_URL is set but Prisma requires explicit configuration. ` +
        `Please ensure DATABASE_URL is a valid PostgreSQL connection string: ${databaseUrl.substring(0, 20)}...`
      )
    }
    throw error
  }
}

function getPrismaClient(): PrismaClient {
  // Check if we're in build phase
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build' ||
                      process.env.NEXT_PHASE === 'phase-export'
  
  // Don't create client during build or if DATABASE_URL is not set
  if (isBuildTime || !process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    throw new Error('PrismaClient cannot be used during build or when DATABASE_URL is not set')
  }

  // Use global instance to prevent multiple instances
  globalForPrisma.prisma ??= createPrismaClient()
  return globalForPrisma.prisma
}

// Lazy getter - only creates PrismaClient when actually accessed
// This prevents initialization errors during build or when DATABASE_URL is not set
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  },
})
