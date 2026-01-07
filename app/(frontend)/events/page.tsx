import { prisma } from '@/lib/db'
import EventsPageClient from './EventsPageClient'

async function getEvents() {
  try {
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
    return events.map((event) => {
      const eventDate = new Date(event.date)
      const attendeeCount = event.attendees.length
      
      let status = 'upcoming'
      if (eventDate < now) {
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
