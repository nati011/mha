import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Skip database calls during build time or if DATABASE_URL is not set
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json({
        totalMembers: 0,
        totalEvents: 0,
      })
    }

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



