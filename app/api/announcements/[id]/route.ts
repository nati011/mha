import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PUT - Update announcement (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (message !== undefined && message.trim() === '') {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.update({
      where: { id: Number.parseInt(params.id) },
      data: {
        ...(message !== undefined && { message: message.trim() }),
        ...(link !== undefined && { link: link || null }),
        ...(linkText !== undefined && { linkText: linkText || null }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
        ...(backgroundColor !== undefined && { backgroundColor: backgroundColor || null }),
        ...(textColor !== undefined && { textColor: textColor || null }),
      },
    })

    return NextResponse.json(announcement)
  } catch (error: any) {
    console.error('Error updating announcement:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

// DELETE - Delete announcement (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.announcement.delete({
      where: { id: Number.parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting announcement:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}

