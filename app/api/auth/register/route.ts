import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSession, hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password, contactPreference } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const existingUser = await prisma.admin.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    const createdUser = await prisma.admin.create({
      data: {
        username,
        passwordHash,
      },
    })

    try {
      await prisma.$executeRaw`
        UPDATE "Admin"
        SET "role" = 'blogger',
            "contactPreference" = ${contactPreference || null}
        WHERE "username" = ${username}
      `
    } catch (error: any) {
      await prisma.admin.delete({
        where: { id: createdUser.id },
      })
      const errorMessage = error?.message || ''
      if (errorMessage.includes('column') && (
        errorMessage.includes('role') || errorMessage.includes('contactPreference')
      )) {
        return NextResponse.json(
          { error: 'Database not migrated. Please add the Admin.role/contactPreference columns.' },
          { status: 500 }
        )
      }
      throw error
    }

    const sessionId = await createSession(username)
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to register account' },
      { status: 500 }
    )
  }
}

