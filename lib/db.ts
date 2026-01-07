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
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
