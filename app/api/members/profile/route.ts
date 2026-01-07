import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const member = await prisma.member.findFirst({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
        bio: true,
        status: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, profilePicture, bio } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const member = await prisma.member.findFirst({
      where: { email },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active members can update their profile' },
        { status: 403 }
      )
    }

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        profilePicture: profilePicture !== undefined ? profilePicture : member.profilePicture,
        bio: bio !== undefined ? bio : member.bio,
      },
    })

    return NextResponse.json({
      id: updatedMember.id,
      firstName: updatedMember.firstName,
      lastName: updatedMember.lastName,
      email: updatedMember.email,
      profilePicture: updatedMember.profilePicture,
      bio: updatedMember.bio,
    })
  } catch (error) {
    console.error('Error updating member profile:', error)
    return NextResponse.json(
      { error: 'Failed to update member profile' },
      { status: 500 }
    )
  }
}

