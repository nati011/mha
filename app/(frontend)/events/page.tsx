import { prisma } from '@/lib/db'
import EventsPageClient from './EventsPageClient'

async function getEvents() {
  try {
    // Skip database calls during build if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      return []
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
    // Set to start of today (midnight) for date-only comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return events.map((event: typeof events[0]) => {
      // Parse event date - handle both date-only and datetime strings
      let eventDate: Date
      const dateStr = event.date.trim()
      
      try {
        // Try to parse as ISO date string first
        eventDate = new Date(dateStr)
        
        // If parsing failed or resulted in invalid date, try manual parsing
        if (isNaN(eventDate.getTime())) {
          // Assume YYYY-MM-DD format and parse manually
          const parts = dateStr.split('-')
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10)
            const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
            const day = parseInt(parts[2], 10)
            eventDate = new Date(year, month, day)
          } else {
            // Fallback: try parsing again
            eventDate = new Date(dateStr)
          }
        }
      } catch (e) {
        // If all parsing fails, default to today
        eventDate = new Date()
      }
      
      // Get date-only (start of day) for comparison
      const eventDateStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      const attendeeCount = event.attendees.length
      
      let status = 'upcoming'
      // Event is past if its date is before today (not including today)
      if (eventDateStart < todayStart) {
        status = 'past'
      } else if (event.capacity && attendeeCount >= event.capacity) {
        status = 'closed'
      }
      
      return {
        ...event,
        status,
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function EventsPage() {
  const allEvents = await getEvents()
  
  return <EventsPageClient events={allEvents} />
}
