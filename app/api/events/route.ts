import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
        chapter: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    // Calculate and add status to each event
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayStartTime = todayStart.getTime()
    
    const eventsWithStatus = events.map((event: typeof events[0]) => {
      // Parse event date - handle both date-only and datetime strings
      let eventDate: Date
      const dateStr = event.date.trim()
      
      try {
        // If date string is in YYYY-MM-DD format, parse it manually to avoid timezone issues
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          // Date-only format (YYYY-MM-DD) - parse manually using local timezone
          const parts = dateStr.split('-')
          const year = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
          const day = parseInt(parts[2], 10)
          eventDate = new Date(year, month, day)
        } else {
          // Try to parse as ISO date string or other format
          eventDate = new Date(dateStr)
          if (isNaN(eventDate.getTime())) {
            const parts = dateStr.split('-')
            if (parts.length === 3) {
              const year = parseInt(parts[0], 10)
              const month = parseInt(parts[1], 10) - 1
              const day = parseInt(parts[2], 10)
              eventDate = new Date(year, month, day)
            } else {
              eventDate = new Date()
            }
          }
        }
      } catch (e) {
        eventDate = new Date()
      }
      
      // Get date-only (start of day) in local timezone for comparison
      const eventDateStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      const eventDateStartTime = eventDateStart.getTime()
      const attendeeCount = event.attendees.length
      
      let status = 'upcoming'
      // Event is past if its date is before today (not including today)
      // Compare timestamps to avoid any timezone issues
      if (eventDateStartTime < todayStartTime) {
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
    const { title, description, date, time, endTime, venue, chapterId, isFree, entranceFee, capacity, category, tags, isRecurring, recurrencePattern, recurrenceEndDate, panelists } = body

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
    if (!panelistsArray || panelistsArray.length === 0 || !panelistsArray.some((p) => p.name && p.role && p.description)) {
      return NextResponse.json(
        { error: 'At least one panelist with name, role, and description is required' },
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
        chapterId: chapterId ? Number.parseInt(chapterId) : null,
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
        chapter: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    
    // Return more specific error messages
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A duplicate entry exists. Please check your input.' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid reference. Please check chapter ID or other references.' },
        { status: 400 }
      )
    }
    
    // Return the actual error message if available
    const errorMessage = error.message || 'Failed to create event'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

