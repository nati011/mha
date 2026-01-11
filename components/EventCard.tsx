import Link from 'next/link'
import { Clock, MapPin, ArrowRight, Users } from 'lucide-react'
import { isUrl } from '@/lib/utils'

interface Panelist {
  id: number
  name: string
  role: string
  image: string | null
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  endTime?: string | null
  venue: string
  description: string
  isFree: boolean
  capacity?: number | null
  attendees?: { id: number }[]
  panelists?: Panelist[]
  status?: string
  chapter?: {
    id: number
    name: string
    location: string | null
  } | null
}

interface EventCardProps {
  event: Event
  index?: number
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
    }
  }

  const dateInfo = formatDate(event.date)
  const dateBoxRotationClasses = [
    'transform -rotate-1 hover:rotate-0',
    'transform rotate-1 hover:rotate-0',
    'transform -rotate-0.5 hover:rotate-0'
  ]
  const venueIsUrl = isUrl(event.venue)

  const attendeeCount = event.attendees?.length || 0
  const panelists = event.panelists || []

  return (
    <Link href={`/events/${event.id}`} className="block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Calendar Date Box */}
          <div className={`flex-shrink-0 w-20 h-20 bg-primary-500 text-white rounded-lg flex flex-col items-center justify-center shadow-md transition-transform duration-200 ${dateBoxRotationClasses[index % dateBoxRotationClasses.length]}`}>
            <div className="text-sm font-bold uppercase leading-tight">{dateInfo.month}</div>
            <div className="text-3xl font-bold leading-none">{dateInfo.day}</div>
            <div className="text-[10px] font-medium opacity-90 mt-1">{dateInfo.dayName}</div>
          </div>
          
          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg leading-tight pr-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {event.isFree && (
                  <span className="inline-flex w-fit bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    FREE
                  </span>
                )}
                {event.status === 'closed' && (
                  <span className="inline-flex w-fit bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    CLOSED
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="font-medium">
                  {event.time}
                  {event.endTime && ` - ${event.endTime}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary-500" />
                {venueIsUrl ? (
                  <a
                    href={event.venue}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary-600 hover:text-primary-700 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>View on Maps</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                ) : (
                  <span className="font-medium">{event.venue}</span>
                )}
              </div>
              {event.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span className="font-medium">{attendeeCount} / {event.capacity}</span>
                </div>
              )}
            </div>

            {/* Panelists */}
            {panelists.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Panelists:</p>
                <div className="flex flex-wrap gap-2">
                  {panelists.slice(0, 3).map((panelist) => (
                    <div key={panelist.id} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                      {panelist.image ? (
                        <img 
                          src={panelist.image} 
                          alt={panelist.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-primary-700">
                            {panelist.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-gray-700 font-medium">{panelist.name}</span>
                      {panelist.role && (
                        <span className="text-[10px] text-gray-500">• {panelist.role}</span>
                      )}
                    </div>
                  ))}
                  {panelists.length > 3 && (
                    <span className="text-xs text-gray-500 self-center">+{panelists.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="inline-flex items-center text-primary-600 font-semibold group mt-2 text-sm">
              Learn More
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

