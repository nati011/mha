import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { qrData } = body

    if (!qrData || !qrData.startsWith('ATTENDEE:')) {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      )
    }

    // Parse QR code: ATTENDEE:attendeeId:eventId
    const parts = qrData.split(':')
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      )
    }

    const attendeeId = Number.parseInt(parts[1])
    const eventId = Number.parseInt(parts[2])

    if (isNaN(attendeeId) || isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid QR code data' },
        { status: 400 }
      )
    }

    const attendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
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

    if (!attendee) {
      return NextResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }

    if (attendee.eventId !== eventId) {
      return NextResponse.json(
        { error: 'QR code does not match event' },
        { status: 400 }
      )
    }

    return NextResponse.json(attendee)
  } catch (error) {
    console.error('Error scanning QR code:', error)
    return NextResponse.json(
      { error: 'Failed to scan QR code' },
      { status: 500 }
    )
  }
}


