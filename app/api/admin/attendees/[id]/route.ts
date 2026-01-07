import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { markAttendeeAsAttended, markAttendeeAsNotAttended } from '@/lib/attendance'
import { prisma } from '@/lib/db'

export async function PATCH(
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
    const { attended, name, email, phone, emergencyContact, ageRange, howHeardAbout, signature } = body

    const attendeeId = Number.parseInt(params.id)

    // If only attended status is being updated
    if (typeof attended === 'boolean' && name === undefined) {
      const updatedAttendee = attended
        ? await markAttendeeAsAttended(attendeeId)
        : await markAttendeeAsNotAttended(attendeeId)

      return NextResponse.json(updatedAttendee)
    }

    // Otherwise, update attendee details
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required' },
        { status: 400 }
      )
    }

    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendeeId },
      data: {
        name,
        email,
        phone,
        emergencyContact: emergencyContact || null,
        ageRange: ageRange || null,
        howHeardAbout: howHeardAbout || null,
        ...(signature !== undefined ? { signature: signature || null } : {}),
        ...(typeof attended === 'boolean' ? {
          attended,
          attendedAt: attended ? new Date() : null,
        } : {}),
      },
    })

    return NextResponse.json(updatedAttendee)
  } catch (error) {
    console.error('Error updating attendee:', error)
    return NextResponse.json(
      { error: 'Failed to update attendee' },
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

    const attendeeId = Number.parseInt(params.id)

    await prisma.attendee.delete({
      where: { id: attendeeId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attendee:', error)
    return NextResponse.json(
      { error: 'Failed to delete attendee' },
      { status: 500 }
    )
  }
}

