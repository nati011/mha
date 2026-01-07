import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Creates a PrismaClient instance with the PostgreSQL adapter
 * This is required for Prisma 7 with PostgreSQL
 */
export function createPrismaClientWithAdapter(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  
  if (!databaseUrl || databaseUrl === '') {
    throw new Error('DATABASE_URL is not set. PrismaClient cannot be initialized without a database URL.')
  }

  // Create a pg Pool connection
  const pool = new Pool({
    connectionString: databaseUrl,
  })
  
  // Create the Prisma adapter
  const adapter = new PrismaPg(pool)
  
  // Create PrismaClient with the adapter
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

