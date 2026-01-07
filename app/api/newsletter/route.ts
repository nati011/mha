import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Check subscription status
      const subscriber = await prisma.newsletterSubscriber.findFirst({
        where: {
          email,
          status: 'subscribed',
        },
        orderBy: { subscribedAt: 'desc' },
      })

      return NextResponse.json({ subscribed: !!subscriber })
    }

    return NextResponse.json({ subscribed: false })
  } catch (error) {
    console.error('Error checking newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findFirst({
      where: { email },
    })

    if (existing) {
      if (existing.status === 'subscribed') {
        return NextResponse.json(
          { error: 'Already subscribed' },
          { status: 400 }
        )
      } else {
        // Resubscribe
        const updated = await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: 'subscribed',
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        })
        return NextResponse.json(updated)
      }
    }

    // Create new subscription (need a newsletter ID - use a default or create one)
    // For now, we'll create a subscriber without newsletterId
    // In production, you'd want to link to a default newsletter
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        newsletterId: 1, // Default newsletter - you may want to create this first
        email,
        name: name || null,
        status: 'subscribed',
      },
    })

    return NextResponse.json(subscriber, { status: 201 })
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error)
    
    if (error.code === 'P2003') {
      // Foreign key constraint - newsletter doesn't exist
      // Create default newsletter first
      try {
        const body = await request.json()
        const { email: emailParam, name: nameParam } = body
        
        const defaultNewsletter = await prisma.newsletter.create({
          data: {
            name: 'Main Newsletter',
            subject: 'Mental Health Addis Updates',
            content: '',
          },
        })

        const subscriber = await prisma.newsletterSubscriber.create({
          data: {
            newsletterId: defaultNewsletter.id,
            email: emailParam,
            name: nameParam || null,
            status: 'subscribed',
          },
        })

        return NextResponse.json(subscriber, { status: 201 })
      } catch (createError) {
        return NextResponse.json(
          { error: 'Failed to subscribe' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { email },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Not subscribed' },
        { status: 404 }
      )
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

