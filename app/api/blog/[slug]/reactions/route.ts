import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rows = await prisma.$queryRaw<{ clapCount: number }[]>`
      SELECT "clapCount"
      FROM "BlogPost"
      WHERE "slug" = ${params.slug}
      LIMIT 1
    `

    if (!rows || rows.length === 0) {
      return NextResponse.json({ clapCount: 0 })
    }

    return NextResponse.json({
      clapCount: rows[0].clapCount ?? 0,
    })
  } catch (error: any) {
    const errorMessage = error?.message || ''
    if (
      errorMessage.includes('column') && errorMessage.includes('clapCount')
    ) {
      return NextResponse.json({ clapCount: 0 })
    }
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { type } = await request.json()
    if (type !== 'clap') {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    const rows = await prisma.$queryRaw<{ clapCount: number }[]>`
      UPDATE "BlogPost"
      SET "clapCount" = "clapCount" + 1
      WHERE "slug" = ${params.slug}
      RETURNING "clapCount"
    `

    if (!rows || rows.length === 0) {
      return NextResponse.json({ clapCount: 0 })
    }

    return NextResponse.json({
      clapCount: rows[0].clapCount ?? 0,
    })
  } catch (error: any) {
    const errorMessage = error?.message || ''
    if (
      errorMessage.includes('column') && errorMessage.includes('clapCount')
    ) {
      return NextResponse.json({ clapCount: 0 })
    }
    console.error('Error updating reactions:', error)
    return NextResponse.json(
      { error: 'Failed to update reactions' },
      { status: 500 }
    )
  }
}

