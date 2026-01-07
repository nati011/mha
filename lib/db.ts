import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // For PostgreSQL (production on Vercel and recommended for local)
  // DATABASE_URL should be a PostgreSQL connection string like:
  // postgresql://user:password@host:port/database
  // Prisma will automatically use DATABASE_URL from environment variables
  
  // During build, if DATABASE_URL is not set, create a client that will fail gracefully
  // The client won't actually connect until a query is made
  try {
    return new PrismaClient()
  } catch (error) {
    // If PrismaClient creation fails (e.g., missing DATABASE_URL during build),
    // return a client anyway - it will fail when used, but won't break the build
    console.warn('PrismaClient creation warning (this is normal during build):', error)
    return new PrismaClient()
  }
}

// Only create PrismaClient if DATABASE_URL is set, or if we're not in build phase
const shouldCreateClient = process.env.DATABASE_URL || 
  !(process.env.NEXT_PHASE === 'phase-production-build' || 
    process.env.NEXT_PHASE === 'phase-development-build' ||
    process.env.NEXT_PHASE === 'phase-export')

export const prisma = shouldCreateClient 
  ? (globalForPrisma.prisma ?? createPrismaClient())
  : ({} as PrismaClient) // Return empty object during build to prevent initialization

if (process.env.NODE_ENV !== 'production' && shouldCreateClient) {
  globalForPrisma.prisma = prisma as PrismaClient
}
