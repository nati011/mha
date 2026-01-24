import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')

    const where: any = {}
    if (published === 'true') {
      where.published = true
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      published,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    const shouldPublish = session.role !== 'blogger' && Boolean(published)
    let contactPreference: string | null = null

    if (session.role === 'blogger') {
      try {
        const rows = await prisma.$queryRaw<{ contactPreference: string | null }[]>`
          SELECT "contactPreference"
          FROM "Admin"
          WHERE "username" = ${session.username}
          LIMIT 1
        `
        contactPreference = rows[0]?.contactPreference ?? null
      } catch (error: any) {
        const errorMessage = error?.message || ''
        const errorCode = error?.code || error?.meta?.code
        const isMissingColumn =
          errorCode === 'P2022' ||
          errorMessage.includes('column') ||
          errorMessage.includes('does not exist')
        if (!isMissingColumn) {
          throw error
        }
      }
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage || null,
        author: author || (session.role === 'blogger' ? session.username : null),
        published: shouldPublish,
        publishedAt: shouldPublish ? new Date() : null,
        contactPreference,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

