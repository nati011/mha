import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { prisma } from './db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getSession(request: NextRequest): Promise<{ isAuthenticated: boolean; username?: string }> {
  // Skip database calls during build time or if DATABASE_URL is not set
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build' ||
                      process.env.NEXT_PHASE === 'phase-export'
  
  if (isBuildTime || !process.env.DATABASE_URL) {
    return { isAuthenticated: false }
  }

  const sessionId = request.cookies.get('admin_session')?.value
  
  if (!sessionId) {
    return { isAuthenticated: false }
  }

  try {
    // Clean up expired sessions first
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // Find the session in the database
    const session = await prisma.session.findUnique({
      where: { sessionId },
    })
    
    if (!session || session.expiresAt < new Date()) {
      // Session expired or not found
      if (session) {
        await prisma.session.delete({
          where: { sessionId }
        })
      }
      return { isAuthenticated: false }
    }

    return { isAuthenticated: true, username: session.username }
  } catch (error) {
    // Handle PrismaClient initialization errors gracefully
    if (error instanceof Error && error.message.includes('DATABASE_URL is not set')) {
      return { isAuthenticated: false }
    }
    if (error instanceof Error && error.message.includes('cannot be used during build')) {
      return { isAuthenticated: false }
    }
    console.error('Error getting session:', error)
    return { isAuthenticated: false }
  }
}

export async function createSession(username: string): Promise<string> {
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  try {
    await prisma.session.create({
      data: {
        sessionId,
        username,
        expiresAt,
      }
    })
    
    return sessionId
  } catch (error) {
    console.error('Error creating session:', error)
    throw error
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: { sessionId }
    })
  } catch (error) {
    // Handle PrismaClient initialization errors gracefully
    if (error instanceof Error && (
      error.message.includes('DATABASE_URL is not set') ||
      error.message.includes('cannot be used during build')
    )) {
      // Silently fail - database not available
      return
    }
    console.error('Error deleting session:', error)
  }
}

export async function requireAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; username?: string } | null> {
  const session = await getSession(request)
  
  if (!session.isAuthenticated) {
    return null
  }
  
  return session
}

