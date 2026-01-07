import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

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

    const body = await request.json()
    const { notes } = body

    const memberId = Number.parseInt(params.id)

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.status !== 'pending') {
      return NextResponse.json(
        { error: 'Member application has already been reviewed' },
        { status: 400 }
      )
    }

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        status: 'active',
        reviewedAt: new Date(),
        reviewedBy: session.username,
        notes: notes || null,
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error accepting member:', error)
    return NextResponse.json(
      { error: 'Failed to accept member' },
      { status: 500 }
    )
  }
}

