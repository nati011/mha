import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      availability,
      activityType,
      areasOfInterest,
      willingToTravel,
      message,
    } = body

    if (!name || !email || !phone || !availability || !activityType) {
      return NextResponse.json(
        { error: 'Name, email, phone, availability, and activity type are required' },
        { status: 400 }
      )
    }

    if (!areasOfInterest || areasOfInterest.length === 0) {
      return NextResponse.json(
        { error: 'At least one area of interest must be selected' },
        { status: 400 }
      )
    }

    // Split name into first and last name
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0] || name
    const lastName = nameParts.slice(1).join(' ') || ''

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

    // Build motivation text with volunteer-specific information
    let motivation = `Volunteer Application\n\n`
    motivation += `Activity Type: ${activityType}\n`
    motivation += `Availability: ${availability}\n`
    motivation += `Willing to Travel: ${willingToTravel}\n`
    if (message) {
      motivation += `\nAdditional Message:\n${message}`
    }

    // Create member record with volunteer application data
    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        interests: areasOfInterest.join(', '), // Store areas of interest
        availability: availability, // Store availability type
        skills: activityType, // Store activity type
        motivation, // Store all volunteer-specific info in motivation
        status: 'pending',
      },
    })

    return NextResponse.json(
      { success: true, id: member.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating volunteer application:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit volunteer application' },
      { status: 500 }
    )
  }
}

