import 'dotenv/config'
import { createPrismaClientWithAdapter } from '../lib/create-prisma-client'

/**
 * Script to resolve failed migration on Vercel database
 * 
 * This marks the failed migration 20260111065110_1 as rolled back
 * so that new migrations can be applied.
 * 
 * Usage:
 *   DATABASE_URL="your-vercel-database-url" tsx scripts/resolve-failed-migration.ts
 */
async function resolveFailedMigration() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('Usage: DATABASE_URL="your-database-url" tsx scripts/resolve-failed-migration.ts')
    process.exit(1)
  }

  try {
    const prisma = createPrismaClientWithAdapter()

    console.log('🔍 Checking for failed migrations...')

    // Check if the failed migration exists
    const failedMigration = await prisma.$queryRaw<Array<{
      migration_name: string
      finished_at: Date | null
      rolled_back_at: Date | null
      started_at: Date
    }>>`
      SELECT "migration_name", "finished_at", "rolled_back_at", "started_at"
      FROM "_prisma_migrations"
      WHERE "migration_name" = '20260111065110_1'
      AND "finished_at" IS NULL
    `

    if (failedMigration.length === 0) {
      console.log('✅ No failed migration found. Migration may have already been resolved.')
      
      // Check if it exists at all
      const allMigrations = await prisma.$queryRaw<Array<{
        migration_name: string
        finished_at: Date | null
        rolled_back_at: Date | null
      }>>`
        SELECT "migration_name", "finished_at", "rolled_back_at"
        FROM "_prisma_migrations"
        WHERE "migration_name" = '20260111065110_1'
      `

      if (allMigrations.length > 0) {
        console.log('ℹ️  Migration exists but is already marked as finished or rolled back.')
        console.log('   Migration status:', allMigrations[0])
      } else {
        console.log('ℹ️  Migration 20260111065110_1 not found in database.')
      }
      
      await prisma.$disconnect()
      process.exit(0)
    }

    console.log(`⚠️  Found failed migration: ${failedMigration[0].migration_name}`)
    console.log(`   Started at: ${failedMigration[0].started_at}`)

    // Mark the migration as rolled back
    console.log('🔄 Marking migration as rolled back...')
    
    await prisma.$executeRaw`
      UPDATE "_prisma_migrations"
      SET "finished_at" = NOW(),
          "rolled_back_at" = NOW()
      WHERE "migration_name" = '20260111065110_1'
        AND "finished_at" IS NULL
    `

    console.log('✅ Migration marked as rolled back successfully!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('   1. Commit and push your code')
    console.log('   2. Redeploy on Vercel')
    console.log('   3. The new migration should now run successfully')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error resolving failed migration:', error)
    process.exit(1)
  }
}

resolveFailedMigration()

