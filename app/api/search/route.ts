import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // events, blog, members, all

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        events: [],
        blogPosts: [],
        members: [],
      })
    }

    const searchTerm = query.toLowerCase().trim()
    const results: any = {
      events: [],
      blogPosts: [],
      members: [],
    }

    // Search events
    if (!type || type === 'all' || type === 'events') {
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { venue: { contains: searchTerm } },
            { category: { contains: searchTerm } },
            { tags: { contains: searchTerm } },
          ],
        },
        include: {
          attendees: {
            select: { id: true },
          },
        },
        take: 10,
      })
      results.events = events
    }

    // Search blog posts
    if (!type || type === 'all' || type === 'blog') {
      const blogPosts = await prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: searchTerm } },
            { excerpt: { contains: searchTerm } },
            { content: { contains: searchTerm } },
            { category: { contains: searchTerm } },
            { tags: { contains: searchTerm } },
          ],
        },
        take: 10,
      })
      results.blogPosts = blogPosts
    }

    // Search members (only active and directory visible)
    if (!type || type === 'all' || type === 'members') {
      const members = await prisma.member.findMany({
        where: {
          status: 'active',
          directoryVisible: true,
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { occupation: { contains: searchTerm } },
            { interests: { contains: searchTerm } },
            { skills: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePicture: true,
          bio: true,
          occupation: true,
          city: true,
        },
        take: 10,
      })
      results.members = members
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}

