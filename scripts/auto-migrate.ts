#!/usr/bin/env node
/**
 * Automatic migration script for Vercel deployments
 * Runs migrations automatically during build if DATABASE_URL is available
 */

import 'dotenv/config'

async function runMigrations() {
  // Log environment for debugging
  console.log('🔍 Migration script started')
  console.log('   VERCEL:', process.env.VERCEL || 'not set')
  console.log('   VERCEL_URL:', process.env.VERCEL_URL || 'not set')
  console.log('   NEXT_PHASE:', process.env.NEXT_PHASE || 'not set')
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set')
  
  const databaseUrl = process.env.DATABASE_URL?.trim()
  
  if (!databaseUrl || databaseUrl === '') {
    console.log('⚠️  DATABASE_URL not set - skipping migrations')
    console.log('   Migrations will need to be run manually after deployment')
    process.exit(0) // Exit successfully
  }

  // Log database URL (first part only for security)
  console.log('   DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'not set')

  // Skip SQLite file URLs (local development)
  if (databaseUrl.startsWith('file:')) {
    console.log('⚠️  SQLite database detected - skipping migrations during build')
    console.log('   Migrations should be run manually for local development')
    process.exit(0) // Exit successfully
  }

  // Only run migrations for PostgreSQL (production)
  if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    console.log('⚠️  Non-PostgreSQL database URL - skipping migrations')
    console.log(`   URL starts with: ${databaseUrl.substring(0, 20)}`)
    process.exit(0) // Exit successfully
  }

  // Check if we're on Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL
  
  console.log(`   Environment detected: ${isVercel ? 'Vercel' : 'Local/Other'}`)
  
  // On Vercel, always try to run migrations during build
  // For local builds, we'll still try but be more lenient with errors

  try {
    const { execSync } = require('child_process')
    
    console.log('🔄 Running database migrations automatically...')
    console.log(`   Environment: ${isVercel ? 'Vercel' : 'Local'}`)
    console.log(`   Database URL: ${databaseUrl.substring(0, 50)}...`)
    console.log(`   Working directory: ${process.cwd()}`)
    
    // Run migrations
    const output = execSync('npx prisma migrate deploy', {
      stdio: 'pipe', // Capture output for better error messages
      env: { ...process.env },
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    
    // Print output
    if (output) {
      console.log(output)
    }
    
    console.log('✅ Migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorOutput = (error as any)?.stderr || (error as any)?.stdout || (error as any)?.output || ''
    const fullError = typeof errorOutput === 'string' ? errorOutput : 
                     (Array.isArray(errorOutput) ? errorOutput.join('\n') : errorOutput?.toString() || errorMessage)
    
    console.error('Migration command output:', fullError)
    console.error('Error message:', errorMessage)
    
    // If it's a "migrations already applied" type error, that's fine
    const combinedError = (errorMessage + ' ' + fullError).toLowerCase()
    if (combinedError.includes('already applied') || 
        combinedError.includes('no pending migrations') ||
        combinedError.includes('database is up to date')) {
      console.log('ℹ️  Migrations are already up to date')
      process.exit(0)
    }
    
    // On Vercel, we want migrations to fail the build if they actually fail
    // This ensures we know about database issues during deployment
    if (isVercel) {
      console.error('❌ Migration failed on Vercel - this will fail the build')
      console.error('   Error:', errorMessage)
      console.error('   Full error output:', fullError)
      console.error('   Please check:')
      console.error('   1. DATABASE_URL is correctly set in Vercel environment variables')
      console.error('   2. Database is accessible from Vercel')
      console.error('   3. Database user has permissions to create tables')
      console.error('   4. Database connection string is valid')
      process.exit(1) // Fail the build on Vercel
    }
    
    // For non-Vercel environments, be more lenient
    console.warn('⚠️  Migration failed (non-fatal):', errorMessage)
    console.warn('   Full error:', fullError)
    console.warn('   This is normal if:')
    console.warn('   - Database is not accessible during build')
    console.warn('   - Connection issues')
    console.warn('   Run "npx prisma migrate deploy" manually after deployment if needed')
    process.exit(0) // Exit successfully to not break the build
  }
}

runMigrations()

