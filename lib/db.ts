import 'server-only'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  // Remove 'file:' prefix for better-sqlite3
  let dbPath = databaseUrl.replace(/^file:/, '')
  
  // If it's a relative path, make it absolute
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.join(process.cwd(), dbPath)
  }
  
  // Use the adapter with url option (matching seed-admin.ts pattern exactly)
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  const client = new PrismaClient({ adapter })
  
  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
