import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        recipients: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
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
    const {
      name,
      type,
      message,
      eventId,
      scheduledFor,
      attendeeIds,
    } = body

    if (!name || !type || !message) {
      return NextResponse.json(
        { error: 'Name, type, and message are required' },
        { status: 400 }
      )
    }

    if (type !== 'event' && type !== 'announcement') {
      return NextResponse.json(
        { error: 'Type must be either "event" or "announcement"' },
        { status: 400 }
      )
    }

    if (type === 'event' && !eventId) {
      return NextResponse.json(
        { error: 'Event ID is required for event campaigns' },
        { status: 400 }
      )
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        type,
        message,
        eventId: eventId ? Number.parseInt(eventId) : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'draft',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

      // Add recipients if provided
      if (attendeeIds && Array.isArray(attendeeIds) && attendeeIds.length > 0) {
        const attendees = await prisma.attendee.findMany({
          where: {
            id: { in: attendeeIds.map((id: string) => Number.parseInt(id)) },
          },
          select: {
            id: true,
            name: true,
            phone: true,
          },
        })

        const recipients = attendees
          .filter((a: { phone: string | null }) => a.phone)
          .map((attendee: { id: number; name: string; phone: string | null }) => ({
            campaignId: campaign.id,
            attendeeId: attendee.id,
            phoneNumber: attendee.phone!,
            name: attendee.name,
          }))

      if (recipients.length > 0) {
        await prisma.campaignRecipient.createMany({
          data: recipients,
        })
      }
    } else if (type === 'event' && eventId) {
      // If no specific attendees selected, add all event attendees
      const eventAttendees = await prisma.attendee.findMany({
        where: {
          eventId: Number.parseInt(eventId),
          phone: { not: null },
        },
        select: {
          id: true,
          name: true,
          phone: true,
        },
      })

      const recipients = eventAttendees.map((attendee: { id: number; name: string; phone: string | null }) => ({
        campaignId: campaign.id,
        attendeeId: attendee.id,
        phoneNumber: attendee.phone!,
        name: attendee.name,
      }))

      if (recipients.length > 0) {
        await prisma.campaignRecipient.createMany({
          data: recipients,
        })
      }
    }

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

