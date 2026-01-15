import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { signature } = body

    if (signature === undefined) {
      return NextResponse.json(
        { error: 'Signature is required' },
        { status: 400 }
      )
    }

    const attendeeId = Number.parseInt(params.id)

    if (Number.isNaN(attendeeId)) {
      return NextResponse.json(
        { error: 'Invalid attendee ID' },
        { status: 400 }
      )
    }

    // Verify attendee exists
    const attendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
    })

    if (!attendee) {
      return NextResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }

    // Update only the signature field
    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendeeId },
      data: {
        signature: signature || null,
      },
    })

    return NextResponse.json({
      id: updatedAttendee.id,
      signature: updatedAttendee.signature,
    })
  } catch (error) {
    console.error('Error updating attendee signature:', error)
    return NextResponse.json(
      { error: 'Failed to save signature' },
      { status: 500 }
    )
  }
}

