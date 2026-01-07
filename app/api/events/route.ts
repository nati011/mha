import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

interface PanelistInput {
  name: string
  role: string
  description: string
  image?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendees: {
          select: {
            id: true,
            attended: true,
          },
        },
        panelists: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        recordings: {
          orderBy: { createdAt: 'asc' },
        },
        feedback: {
          select: {
            type: true,
          },
        },
      },
    })

    // Calculate and add status to each event
    const now = new Date()
    const eventsWithStatus = events.map((event: typeof events[0]) => {
      const eventDate = new Date(event.date)
      const attendeeCount = event.attendees.length
      
      let status = 'upcoming'
      if (eventDate < now) {
        status = 'past'
      } else if (event.capacity && attendeeCount >= event.capacity) {
        status = 'closed'
      }
      
      return {
        ...event,
        status,
      }
    })

    return NextResponse.json(eventsWithStatus)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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
    const { title, description, date, time, endTime, venue, isFree, entranceFee, capacity, category, tags, isRecurring, recurrencePattern, recurrenceEndDate, panelists } = body

    if (!title || !description || !date || !time || !venue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date,
        time,
        endTime: endTime || null,
        venue,
        isFree: isFree ?? true,
        entranceFee: isFree ? null : (entranceFee ? parseFloat(entranceFee) : null),
        capacity: capacity ? Number.parseInt(capacity) : null,
        category: category || null,
        tags: tags || null,
        isRecurring: isRecurring || false,
        recurrencePattern: recurrencePattern || null,
        recurrenceEndDate: recurrenceEndDate || null,
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
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

