import { prisma } from '@/lib/db'
import EventsPageClient from './EventsPageClient'

async function getEvents() {
  try {
    // Skip database calls during build if DATABASE_URL is not set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      console.warn('[getEvents] DATABASE_URL not set, returning empty array')
      return []
    }

    // Check if we're in build phase
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build' ||
                        process.env.NEXT_PHASE === 'phase-export'
    
    if (isBuildTime) {
      console.warn('[getEvents] Build time detected, returning empty array')
      return []
    }

    // Try to access prisma - this might throw if DATABASE_URL is not set
    try {
      if (!prisma || !prisma.event) {
        console.error('[getEvents] Prisma client not available')
        return []
      }
    } catch (prismaError) {
      const errorMsg = prismaError instanceof Error ? prismaError.message : String(prismaError)
      if (errorMsg.includes('DATABASE_URL is not set') || errorMsg.includes('cannot be used during build')) {
        console.warn('[getEvents] Prisma client not available:', errorMsg)
        return []
      }
      throw prismaError
    }

    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendees: {
          select: {
            id: true,
          },
        },
        panelists: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    
    // Calculate status for each event
    const now = new Date()
    // Set to start of today (midnight) in local timezone for date-only comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayStartTime = todayStart.getTime()
    
    return events.map((event: typeof events[0]) => {
      // Parse event date - handle both date-only and datetime strings
      let eventDate: Date
      const dateStr = event.date.trim()
      
      try {
        // If date string is in YYYY-MM-DD format, parse it manually to avoid timezone issues
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          // Date-only format (YYYY-MM-DD) - parse manually using local timezone
          const parts = dateStr.split('-')
          const year = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
          const day = parseInt(parts[2], 10)
          eventDate = new Date(year, month, day)
        } else {
          // Try to parse as ISO date string or other format
          eventDate = new Date(dateStr)
          
          // If parsing failed, try manual parsing
          if (isNaN(eventDate.getTime())) {
            const parts = dateStr.split('-')
            if (parts.length === 3) {
              const year = parseInt(parts[0], 10)
              const month = parseInt(parts[1], 10) - 1
              const day = parseInt(parts[2], 10)
              eventDate = new Date(year, month, day)
            } else {
              // Fallback: default to today
              eventDate = new Date()
            }
          }
        }
      } catch (e) {
        // If all parsing fails, default to today
        eventDate = new Date()
      }
      
      // Get date-only (start of day) in local timezone for comparison
      const eventDateStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      const eventDateStartTime = eventDateStart.getTime()
      const attendeeCount = event.attendees.length
      
      let status = 'upcoming'
      // Event is past if its date is before today (not including today)
      // Compare timestamps to avoid any timezone issues
      if (eventDateStartTime < todayStartTime) {
        status = 'past'
      } else if (event.capacity && attendeeCount >= event.capacity) {
        status = 'closed'
      }
      
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Event Status] "${event.title}" | Date: "${dateStr}" | Parsed: ${eventDateStart.toISOString().split('T')[0]} | Today: ${todayStart.toISOString().split('T')[0]} | Status: ${status}`)
      }
      
      return {
        ...event,
        status,
      }
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorCode = (error as any)?.code
    
    // Handle specific Prisma errors
    if (errorMsg.includes('DATABASE_URL is not set') || 
        errorMsg.includes('cannot be used during build') ||
        errorMsg.includes('does not exist') ||
        errorCode === 'P2021') {
      console.warn('[getEvents] Database not available:', errorMsg)
      return []
    }
    
    console.error('[getEvents] Error fetching events:', error)
    console.error('[getEvents] Error details:', errorMsg)
    console.error('[getEvents] Error code:', errorCode)
    return []
  }
}

// Force dynamic rendering to ensure data is fetched at runtime
export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const allEvents = await getEvents()
  
  return <EventsPageClient events={allEvents} />
}
