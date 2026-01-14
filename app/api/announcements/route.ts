import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Fetch announcements (public for active, admin for all)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const includeInactive = url.searchParams.get('includeInactive') === 'true'
    
    // Check if user is admin
    const session = await requireAuth(request).catch(() => null)
    const isAdmin = session !== null

    const announcements = await prisma.announcement.findMany({
      where: includeInactive && isAdmin 
        ? {} 
        : { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST - Create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, link, linkText, isActive, priority, backgroundColor, textColor } = body

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        message: message.trim(),
        link: link || null,
        linkText: linkText || null,
        isActive: isActive ?? true,
        priority: priority ?? 0,
        backgroundColor: backgroundColor || null,
        textColor: textColor || null,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error: any) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    )
  }
}

