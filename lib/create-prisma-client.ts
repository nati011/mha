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

  // Check if it's a SQLite connection string (should not happen with PostgreSQL setup)
  if (databaseUrl.startsWith('file:')) {
    throw new Error(
      'Invalid DATABASE_URL: SQLite connection string detected. ' +
      'This application requires PostgreSQL. ' +
      'Please set DATABASE_URL to a PostgreSQL connection string like: ' +
      'postgresql://user:password@host:port/database?sslmode=require'
    )
  }

  // Validate that it's a PostgreSQL connection string
  if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    throw new Error(
      'Invalid DATABASE_URL format. Expected PostgreSQL connection string starting with postgres:// or postgresql://'
    )
  }

  // Parse the connection string to validate it
  try {
    const url = new URL(databaseUrl)
    if (!url.password && url.username) {
      // Password might be empty, which is valid for some setups
      // But if username exists, password should be a string (even if empty)
      console.warn('DATABASE_URL password is empty. This might cause connection issues.')
    }
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Create a pg Pool connection
  // For local development, we may need to handle SSL differently
  const poolConfig: any = {
    connectionString: databaseUrl,
  }

  // If connecting to localhost, disable SSL verification for self-signed certificates
  // This is safe for local development only
  if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
    // Parse the URL to modify sslmode if needed
    try {
      const url = new URL(databaseUrl)
      // If sslmode=require is set but we're on localhost, we need to configure SSL
      if (url.searchParams.get('sslmode') === 'require') {
        poolConfig.ssl = {
          rejectUnauthorized: false, // Allow self-signed certificates for localhost
        }
      } else if (!url.searchParams.has('sslmode')) {
        // No SSL mode specified, default to no SSL for localhost
        poolConfig.ssl = false
      }
    } catch (e) {
      // If URL parsing fails, just use the connection string as-is
    }
  }

  const pool = new Pool(poolConfig)
  
  // Create the Prisma adapter
  const adapter = new PrismaPg(pool)
  
  // Create PrismaClient with the adapter
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

