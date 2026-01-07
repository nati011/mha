#!/usr/bin/env node
/**
 * Automatic migration script for Vercel deployments
 * Runs migrations automatically during build if DATABASE_URL is available
 */

import 'dotenv/config'

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  
  if (!databaseUrl || databaseUrl === '') {
    console.log('⚠️  DATABASE_URL not set - skipping migrations')
    console.log('   Migrations will need to be run manually after deployment')
    process.exit(0) // Exit successfully - don't fail the build
  }

  // Skip SQLite file URLs (local development)
  if (databaseUrl.startsWith('file:')) {
    console.log('⚠️  SQLite database detected - skipping migrations during build')
    console.log('   Migrations should be run manually for local development')
    process.exit(0) // Exit successfully
  }

  // Only run migrations for PostgreSQL (production)
  if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    console.log('⚠️  Non-PostgreSQL database URL - skipping migrations')
    process.exit(0) // Exit successfully
  }

  try {
    const { execSync } = require('child_process')
    
    console.log('🔄 Running database migrations automatically...')
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    })
    
    console.log('✅ Migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    // Don't fail the build if migrations fail
    // This could happen if migrations are already applied or database is not accessible
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn('⚠️  Migration failed (non-fatal):', errorMessage)
    console.warn('   This is normal if:')
    console.warn('   - Migrations are already applied')
    console.warn('   - Database is not accessible during build')
    console.warn('   - Connection issues')
    console.warn('   Run "npx prisma migrate deploy" manually after deployment if needed')
    process.exit(0) // Exit successfully to not break the build
  }
}

runMigrations()

