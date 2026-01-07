import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all events
    const events = await prisma.event.findMany({
      select: {
        id: true,
      },
    })

    // Get all active members
    const members = await prisma.member.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({
      totalMembers: members.length,
      totalEvents: events.length,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}


