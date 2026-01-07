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

    const volunteers = await prisma.volunteer.findMany({
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
        assignments: {
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
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
    const { memberId, roles, skills, availability } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Check if member exists and is active
    const member = await prisma.member.findUnique({
      where: { id: Number.parseInt(memberId) },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active members can become volunteers' },
        { status: 400 }
      )
    }

    // Check if already a volunteer
    const existing = await prisma.volunteer.findUnique({
      where: { memberId: Number.parseInt(memberId) },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Member is already a volunteer' },
        { status: 400 }
      )
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        memberId: Number.parseInt(memberId),
        roles: roles || null,
        skills: skills || null,
        availability: availability || null,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(volunteer, { status: 201 })
  } catch (error: any) {
    console.error('Error creating volunteer:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Member is already a volunteer' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create volunteer' },
      { status: 500 }
    )
  }
}

