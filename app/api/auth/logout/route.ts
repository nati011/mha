import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')

  return response
}

