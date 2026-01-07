import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const recordings = await prisma.recording.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(recordings)
  } catch (error) {
    console.error('Error fetching recordings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    )
  }
}

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
    const { title, description, url, thumbnail, duration, eventId } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      )
    }

    const recording = await prisma.recording.create({
      data: {
        title,
        description: description || null,
        url,
        thumbnail: thumbnail || null,
        duration: duration || null,
        eventId: eventId ? Number.parseInt(eventId) : null,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    })

    return NextResponse.json(recording, { status: 201 })
  } catch (error) {
    console.error('Error creating recording:', error)
    return NextResponse.json(
      { error: 'Failed to create recording' },
      { status: 500 }
    )
  }
}

