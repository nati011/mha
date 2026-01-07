import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      console.error(`Admin user "${username}" not found`)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, admin.passwordHash)

    if (!isValid) {
      console.error(`Password verification failed for user "${username}"`)
      console.error('Attempted password:', password.substring(0, 3) + '***') // Log first 3 chars for debugging
      console.error('Expected password should be: admin123')
      return NextResponse.json(
        { error: 'Invalid credentials. Make sure you are using the correct password.' },
        { status: 401 }
      )
    }

    console.log(`✅ Successful login for user "${username}"`)

    const sessionId = await createSession(admin.username)

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/', // Ensure cookie is available for all paths
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

