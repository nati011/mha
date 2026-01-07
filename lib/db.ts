import 'server-only'
import { PrismaClient } from '@prisma/client'
import { createPrismaClientWithAdapter } from './create-prisma-client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // For PostgreSQL (production on Vercel and recommended for local)
  // DATABASE_URL should be a PostgreSQL connection string like:
  // postgresql://user:password@host:port/database
  // Prisma 7 requires an adapter for PostgreSQL
  
  // Use the shared helper function to create PrismaClient with adapter
  return createPrismaClientWithAdapter()
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
    try {
      const client = getPrismaClient()
      const value = (client as any)[prop]
      
      // If it's a function, bind it to the client
      if (typeof value === 'function') {
        return value.bind(client)
      }
      
      return value
    } catch (error) {
      // If PrismaClient initialization fails, return a dummy object that throws on use
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes('DATABASE_URL is not set') || errorMsg.includes('cannot be used during build')) {
        // Return a proxy that throws helpful errors when methods are called
        return new Proxy(() => {}, {
          apply() {
            throw new Error('PrismaClient is not available. DATABASE_URL is not set or build is in progress.')
          },
          get() {
            throw new Error('PrismaClient is not available. DATABASE_URL is not set or build is in progress.')
          }
        })
      }
      throw error
    }
  },
})
