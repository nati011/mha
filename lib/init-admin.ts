import 'server-only'
import { prisma } from './db'
import { hashPassword } from './auth'

/**
 * Ensures the default admin user exists in the database
 * This is called automatically when needed - no migrations required
 * 
 * @param username - Admin username (default: 'admin')
 * @param password - Admin password (default: 'admin123')
 * @returns Promise<boolean> - true if admin was created/updated, false if skipped
 */
export async function ensureAdminUser(
  username: string = 'admin',
  password: string = 'admin123'
): Promise<boolean> {
  // Skip during build time or if DATABASE_URL is not set
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build' ||
                      process.env.NEXT_PHASE === 'phase-export'
  
  if (isBuildTime || !process.env.DATABASE_URL) {
    return false
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    })

    // If admin exists, we're done
    if (existingAdmin) {
      return false // Already exists, no action needed
    }

    // Create the admin user
    const passwordHash = await hashPassword(password)
    
    await prisma.admin.create({
      data: {
        username,
        passwordHash,
      },
    })

    console.log(`✅ Admin user "${username}" created successfully via code initialization`)
    return true
  } catch (error) {
    // If it's a unique constraint error, admin already exists (race condition)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return false // Admin already exists
    }
    
    console.error('Error ensuring admin user:', error)
    return false
  }
}

/**
 * Initialize admin user - called automatically on app startup
 * This ensures the admin user exists without requiring migrations
 */
export async function initializeAdminUser(): Promise<void> {
  // Only run in production or development runtime (not during build)
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    // Run asynchronously to not block app startup
    ensureAdminUser().catch((error) => {
      console.warn('Admin user initialization skipped:', error instanceof Error ? error.message : error)
    })
  }
}

