'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import EventCard from '@/components/EventCard'

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  venue: string
  isFree: boolean
  capacity: number | null
  status: string
  attendees: { id: number }[]
  panelists: Array<{
    id: number
    name: string
    role: string
    image: string | null
  }>
  openingNotes?: string | null
  closingNotes?: string | null
  chapter?: {
    id: number
    name: string
    location: string | null
  } | null
}

export default function EventsPageClient({ events: initialEvents }: { events: Event[] }) {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  
  const filteredEvents = initialEvents
    .filter((event) => {
      return event.status === filter
    })
    .sort((a, b) => {
      // Sort by date descending (latest/newest first)
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  
  const upcomingCount = initialEvents.filter((e) => e.status === 'upcoming').length
  const pastCount = initialEvents.filter((e) => e.status === 'past').length
  
  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('EventsPageClient - Total events:', initialEvents.length)
    console.log('EventsPageClient - Upcoming count:', upcomingCount)
    console.log('EventsPageClient - Past count:', pastCount)
    console.log('EventsPageClient - Current filter:', filter)
    console.log('EventsPageClient - Filtered events:', filteredEvents.length)
    console.log('EventsPageClient - All events with status:', initialEvents.map(e => ({ title: e.title, date: e.date, status: e.status })))
  }

  const eventTypes = [
    {
      icon: Users,
      title: 'Community Dialogues',
      description:
        'Open discussions on mental health topics with community members and experts.',
    },
    {
      icon: Calendar,
      title: 'Monthly Talks',
      description:
        'Regular educational sessions covering various aspects of mental health and wellness.',
    },
    {
      icon: Clock,
      title: 'Peer Support',
      description:
        'Regular meetups where community members can share experiences and support each other.',
    },
    {
      icon: MapPin,
      title: 'Workshops',
      description:
        'Hands-on learning sessions with practical tools and strategies for mental wellness.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Upcoming Events Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="container-custom relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Events & Calendar
          </h2>
          
          {/* Filter Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === 'upcoming'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === 'past'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past ({pastCount})
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No {filter} events at this time.</p>
              <p className="text-gray-500 mt-2">Check back soon for new events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: any, index: number) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', '-rotate-1']
                return (
                  <div key={event.id} className={`transform ${rotations[index % rotations.length]} hover:rotate-0 transition-transform duration-300`}>
                    <div className="border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-primary-50/30">
                      <EventCard event={event} index={index} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Event Types Section with Fun Styling */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        {/* Flowing divider */}
        <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1200 100" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 Q150,10 300,50 Q450,80 600,30 Q750,5 900,55 Q1050,85 1200,40 L1200,0 L0,0 Z"
              fill="white"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Types of Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventTypes.map((type, index) => {
              const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2']
              return (
                <div
                  key={type.title}
                  className={`bg-white rounded-xl p-8 shadow-sm border-2 border-gray-100 text-center hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform ${rotations[index]} hover:rotate-0`}
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <type.icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Event Guidelines Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        {/* Flowing divider */}
        <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1200 80" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,15 Q100,30 200,20 Q300,10 400,25 Q500,40 600,25 Q700,10 800,30 Q900,50 1000,35 Q1100,20 1200,30 L1200,0 L0,0 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Event Guidelines
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-md space-y-4 border-2 border-primary-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Registration
                </h3>
                <p className="text-gray-600">
                  Most events are free and open to all. Some events may require
                  advance registration. Check individual event details for
                  specific requirements.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What to Expect
                </h3>
                <p className="text-gray-600">
                  Our events are designed to be safe, welcoming spaces. We
                  encourage respectful dialogue, active listening, and
                  confidentiality. All participants are expected to maintain a
                  supportive and non-judgmental environment.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Accessibility
                </h3>
                <p className="text-gray-600">
                  We strive to make our events accessible to everyone. If you
                  need accommodations, please contact us in advance, and we'll
                  do our best to accommodate your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

