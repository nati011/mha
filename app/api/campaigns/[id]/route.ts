import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { sendSMS } from '@/lib/sms'

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

    const campaign = await prisma.campaign.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            venue: true,
          },
        },
        recipients: {
          include: {
            attendee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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
    const {
      name,
      message,
      scheduledFor,
      attendeeIds,
    } = body

    const campaign = await prisma.campaign.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot edit a sent campaign' },
        { status: 400 }
      )
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: Number.parseInt(params.id) },
      data: {
        name: name || campaign.name,
        message: message || campaign.message,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : campaign.scheduledFor,
        status: scheduledFor ? 'scheduled' : campaign.status,
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

    // Update recipients if provided
    if (attendeeIds && Array.isArray(attendeeIds)) {
      // Delete existing recipients
      await prisma.campaignRecipient.deleteMany({
        where: { campaignId: campaign.id },
      })

      // Add new recipients
      if (attendeeIds.length > 0) {
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
          .filter((a) => a.phone)
          .map((attendee) => ({
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
    }

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        recipients: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Campaign has already been sent' },
        { status: 400 }
      )
    }

    if (!campaign.recipients || campaign.recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found for this campaign' },
        { status: 400 }
      )
    }

    // Send SMS to all recipients
    let sentCount = 0
    let failedCount = 0

    for (const recipient of campaign.recipients) {
      try {
        const result = await sendSMS(recipient.phoneNumber, campaign.message)

        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: result.success ? 'sent' : 'failed',
            sentAt: result.success ? new Date() : null,
            error: result.error || null,
          },
        })

        if (result.success) {
          sentCount++
        } else {
          failedCount++
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error: any) {
        console.error(`Error sending SMS to ${recipient.phoneNumber}:`, error)
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'failed',
            error: error.message || 'Failed to send SMS',
          },
        })
        failedCount++
      }
    }

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      ...updatedCampaign,
      stats: {
        sent: sentCount,
        failed: failedCount,
        total: campaign.recipients.length,
      },
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send campaign' },
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot delete a sent campaign' },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id: Number.parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}

