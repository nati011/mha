import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const waitlist = await prisma.waitlist.findMany({
      where: { eventId: Number.parseInt(params.id) },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(waitlist)
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
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
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        attendees: true,
        waitlist: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if already registered
    const existingAttendee = event.attendees.find((a: { email: string }) => a.email === email)
    if (existingAttendee) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Check if already on waitlist
    const existingWaitlist = event.waitlist.find((w: { email: string }) => w.email === email)
    if (existingWaitlist) {
      return NextResponse.json(
        { error: 'You are already on the waitlist' },
        { status: 400 }
      )
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        eventId: Number.parseInt(params.id),
        name,
        email,
        phone: phone || null,
      },
    })

    return NextResponse.json(waitlistEntry, { status: 201 })
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    )
  }
}

