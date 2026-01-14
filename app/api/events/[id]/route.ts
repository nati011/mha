import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

interface PanelistInput {
  name: string
  role: string
  description: string
  image?: string | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        attendees: {
          orderBy: { createdAt: 'desc' },
        },
        panelists: {
          orderBy: { createdAt: 'asc' },
        },
        chapter: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Calculate and add status
    const now = new Date()
    const eventDate = new Date(event.date)
    const attendeeCount = event.attendees.length
    
    let status = 'upcoming'
    if (eventDate < now) {
      status = 'past'
    } else if (event.capacity && attendeeCount >= event.capacity) {
      status = 'closed'
    }

    return NextResponse.json({
      ...event,
      status,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

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
    const { title, description, date, time, endTime, venue, chapterId, isFree, entranceFee, capacity, category, tags, isRecurring, recurrencePattern, recurrenceEndDate, openingNotes, closingNotes, panelists } = body

    if (!isFree && (!entranceFee || entranceFee <= 0)) {
      return NextResponse.json(
        { error: 'Entrance fee is required for paid events' },
        { status: 400 }
      )
    }

    const panelistsArray = panelists as PanelistInput[]
    if (!panelistsArray || panelistsArray.length === 0 || !panelistsArray.some((p) => p.name && p.role)) {
      return NextResponse.json(
        { error: 'At least one panelist with name and role is required' },
        { status: 400 }
      )
    }

    // First, delete existing panelists
    await prisma.panelist.deleteMany({
      where: { eventId: Number.parseInt(params.id) },
    })

    const event = await prisma.event.update({
      where: { id: Number.parseInt(params.id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { date }),
        ...(time && { time }),
        ...(endTime !== undefined && { endTime: endTime || null }),
        ...(venue && { venue }),
        ...(chapterId !== undefined && { chapterId: chapterId ? Number.parseInt(chapterId) : null }),
        ...(isFree !== undefined && { isFree }),
        ...(entranceFee !== undefined && { entranceFee: isFree ? null : (entranceFee ? parseFloat(entranceFee) : null) }),
        ...(capacity !== undefined && { capacity: capacity ? Number.parseInt(capacity) : null }),
        ...(category !== undefined && { category: category || null }),
        ...(tags !== undefined && { tags: tags || null }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurrencePattern !== undefined && { recurrencePattern: recurrencePattern || null }),
        ...(recurrenceEndDate !== undefined && { recurrenceEndDate: recurrenceEndDate || null }),
        ...(openingNotes !== undefined && { openingNotes: openingNotes || null }),
        ...(closingNotes !== undefined && { closingNotes: closingNotes || null }),
        panelists: {
          create: panelistsArray.map((panelist) => ({
            name: panelist.name,
            role: panelist.role,
            description: panelist.description || '',
            image: panelist.image || null,
          })),
        },
      },
      include: {
        panelists: true,
        chapter: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

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

    await prisma.event.delete({
      where: { id: Number.parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

