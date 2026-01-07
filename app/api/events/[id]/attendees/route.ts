import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
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

    const attendees = await prisma.attendee.findMany({
      where: { eventId: Number.parseInt(params.id) },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(attendees)
  } catch (error) {
    console.error('Error fetching attendees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      occupation,
      emergencyContact,
      ageRange,
      howHeardAbout,
    } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check capacity if set
    if (event.capacity) {
      const attendeeCount = await prisma.attendee.count({
        where: { eventId: Number.parseInt(params.id) },
      })

      if (attendeeCount >= event.capacity) {
        return NextResponse.json(
          { error: 'Event is at capacity' },
          { status: 400 }
        )
      }
    }

    // Check if email already registered for this event
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        eventId: Number.parseInt(params.id),
        email,
      },
    })

    if (existingAttendee) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    const attendee = await prisma.attendee.create({
      data: {
        eventId: Number.parseInt(params.id),
        name,
        email,
        phone,
        occupation: occupation || null,
        emergencyContact: emergencyContact || null,
        ageRange: ageRange || null,
        howHeardAbout: howHeardAbout || null,
      },
    })

    return NextResponse.json(attendee, { status: 201 })
  } catch (error) {
    console.error('Error creating attendee:', error)
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}

