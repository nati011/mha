import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getAllAttendedAttendees, getUniqueAttendedAttendees } from '@/lib/attendance'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unique = searchParams.get('unique') === 'true'

    const attendees = unique
      ? await getUniqueAttendedAttendees()
      : await getAllAttendedAttendees()

    return NextResponse.json(attendees)
  } catch (error) {
    console.error('Error fetching attended attendees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    )
  }
}

