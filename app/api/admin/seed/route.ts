import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { ensureAdminUser } from '@/lib/init-admin'

// This endpoint seeds the default admin user using code-based initialization
// It's safe to call multiple times (uses upsert)
// Should be called after deployment or can be triggered automatically

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Skip during build time
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build' ||
                      process.env.NEXT_PHASE === 'phase-export'
  
  if (isBuildTime || !process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      message: 'Seeding skipped during build or DATABASE_URL not set',
    })
  }

  try {
    // Optional: Add a secret token for security (recommended for production)
    // But allow auto-seeding from same origin (for automatic deployment seeding)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.SEED_SECRET_TOKEN
    const origin = request.headers.get('origin') || request.headers.get('referer')
    const isSameOrigin = !origin || origin.includes(process.env.VERCEL_URL || 'localhost')
    
    // Allow if: no token required, token matches, or same origin (for auto-seeding)
    if (expectedToken && authHeader !== `Bearer ${expectedToken}` && !isSameOrigin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const username = 'admin'
    const password = 'admin123'

    // Use code-based initialization (not migrations) to create/update admin user
    const passwordHash = await hashPassword(password)

    const admin = await prisma.admin.upsert({
      where: { username },
      update: {
        passwordHash, // Update password to ensure it's correct
      },
      create: {
        username,
        passwordHash,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Admin user "${username}" initialized via code (not migrations)`,
      username: admin.username,
      createdAt: admin.createdAt,
    })
  } catch (error) {
    console.error('Error seeding admin:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed admin user',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

// Also allow GET for easy triggering
export async function GET(request: NextRequest) {
  return POST(request)
}

