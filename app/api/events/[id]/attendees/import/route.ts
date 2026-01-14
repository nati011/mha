import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await requireAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { attendees } = body

    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: 'No attendees provided' },
        { status: 400 }
      )
    }

    const eventId = Number.parseInt(params.id)

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check capacity if set
    const currentAttendeeCount = await prisma.attendee.count({
      where: { eventId },
    })

    let created = 0
    let skipped = 0

    // Process attendees in batches
    for (const attendeeData of attendees) {
      const { name, email, phone, occupation, emergencyContact, ageRange, howHeardAbout } = attendeeData

      // Validate required fields
      if (!name || !email || !phone) {
        skipped++
        continue
      }

      // Check capacity
      if (event.capacity && currentAttendeeCount + created >= event.capacity) {
        break
      }

      // Check if attendee already exists for this event
      const existingAttendee = await prisma.attendee.findFirst({
        where: {
          eventId,
          email: email.toLowerCase().trim(),
        },
      })

      if (existingAttendee) {
        skipped++
        continue
      }

      // Create attendee
      await prisma.attendee.create({
        data: {
          eventId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          occupation: occupation?.trim() || null,
          emergencyContact: emergencyContact?.trim() || null,
          ageRange: ageRange?.trim() || null,
          howHeardAbout: howHeardAbout?.trim() || null,
        },
      })

      created++
    }

    const skippedMsg = skipped > 0 ? `${skipped} duplicates skipped.` : ''
    return NextResponse.json({
      created,
      skipped,
      message: `Successfully imported ${created} attendees. ${skippedMsg}`,
    })
  } catch (error: any) {
    console.error('Error importing attendees:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import attendees' },
      { status: 500 }
    )
  }
}

