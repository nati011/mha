import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type, message } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      )
    }

    if (type !== 'questions' && type !== 'comments') {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Store feedback in database
    const feedback = await prisma.eventFeedback.create({
      data: {
        eventId: Number.parseInt(params.id),
        type: type === 'questions' ? 'question' : 'comment', // Map 'questions' to 'question'
        feedback: message,
        name: null, // Anonymous by default
        email: null,
        anonymous: true,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Feedback submitted successfully',
      id: feedback.id
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

// GET endpoint for admin to fetch feedback
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'question' or 'comment' or null for all

    const where: any = {
      eventId: Number.parseInt(params.id),
    }

    if (type && (type === 'question' || type === 'comment')) {
      where.type = type
    }

    const feedback = await prisma.eventFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
