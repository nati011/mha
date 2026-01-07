import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')

    const where: any = {}
    if (status) {
      where.status = status
    } else {
      where.status = 'approved' // Public only sees approved
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (category) {
      where.category = category
    }

    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      authorName,
      authorEmail,
      anonymous,
      category,
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const story = await prisma.story.create({
      data: {
        title,
        content,
        authorName: anonymous ? null : (authorName || null),
        authorEmail: anonymous ? null : (authorEmail || null),
        anonymous: anonymous || true,
        category: category || null,
        status: 'pending',
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    )
  }
}

