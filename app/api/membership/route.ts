import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      occupation,
      education,
      interests,
      motivation,
      experience,
      availability,
      skills,
    } = body

    if (!firstName || !lastName || !email || !motivation) {
      return NextResponse.json(
        { error: 'First name, last name, email, and motivation are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingMember = await prisma.member.findFirst({
      where: { email },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        address: address || null,
        city: city || null,
        occupation: occupation || null,
        education: education || null,
        interests: interests || null,
        motivation,
        experience: experience || null,
        availability: availability || null,
        skills: skills || null,
        status: 'pending',
      },
    })

    return NextResponse.json(
      { success: true, id: member.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating membership application:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit membership application' },
      { status: 500 }
    )
  }
}

