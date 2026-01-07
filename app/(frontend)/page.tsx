import Link from 'next/link'
import { ArrowRight, CheckCircle, Calendar, MapPin, Clock, Heart, Users, BookOpen, Shield, Bell } from 'lucide-react'
import { prisma } from '@/lib/db'
import { isUrl } from '@/lib/utils'

async function getUpcomingEvents() {
  try {
    const now = new Date()
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
    
    // Filter upcoming events and calculate status
    const upcomingEvents = events
      .filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= now
      })
      .map((event) => {
        const eventDate = new Date(event.date)
        const attendeeCount = event.attendees.length
        
        let status = 'upcoming'
        if (event.capacity && attendeeCount >= event.capacity) {
          status = 'closed'
        }
        
        return {
          ...event,
          status,
        }
      })
      .filter((event) => event.status === 'upcoming')
      .slice(0, 3)
    
    return upcomingEvents
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

async function getStats() {
  try {
    if (!prisma || !prisma.member || !prisma.event) {
      console.error('Prisma client or models not available')
      return {
        totalMembers: 0,
        totalEvents: 0,
      }
    }
    
    const [totalMembers, totalEvents] = await Promise.all([
      prisma.member.count({
        where: {
          status: 'active',
        },
      }),
      prisma.event.count(),
    ])
    
    return {
      totalMembers,
      totalEvents,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalMembers: 0,
      totalEvents: 0,
    }
  }
}

export default async function Home() {
  const upcomingEvents = await getUpcomingEvents()
  const stats = await getStats()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - BetterHelp Style */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-primary-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Empowering Minds,
                <br />
                Building Community
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 font-normal leading-relaxed">
                We raise awareness, dismantle stigma, and create safe spaces for
                meaningful discussions about mental health in Addis Ababa and beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/advocacy"
                  className="inline-block bg-primary-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition-all duration-200 shadow-sm hover:shadow-md transform rotate-1 hover:rotate-0"
                >
                  Get Involved
                </Link>
              </div>
            </div>

            {/* Right side - Upcoming Events Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-100 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary-500 fill-primary-500 animate-bell-ring" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upcoming Events
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="text-sm text-primary-500 font-semibold hover:text-primary-600 transition-colors underline decoration-2 underline-offset-2"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No upcoming events at this time.</p>
                    <Link href="/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                      View all events →
                    </Link>
                  </div>
                ) : (
                  upcomingEvents.map((event, index) => {
                    const rotationClasses = [
                      'transform rotate-1 hover:rotate-0',
                      'transform -rotate-1 hover:rotate-0',
                      'transform rotate-0.5 hover:rotate-0'
                    ]
                    return (
                      <div
                        key={event.id}
                        className={`border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-primary-50/30 ${rotationClasses[index]}`}
                      >
                        <EventCard event={event} index={index} />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        {/* Flowing divider - Top */}
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
        
        {/* Flowing divider - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <svg 
            className="absolute bottom-0 left-0 w-full h-full" 
            viewBox="0 0 1200 100" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,40 Q150,80 300,50 Q450,10 600,60 Q750,90 900,35 Q1050,5 1200,55 L1200,100 L0,100 Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're dedicated to creating a supportive community where mental health is understood, 
              accepted, and prioritized in Addis Ababa and beyond.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safe Spaces</h3>
              <p className="text-gray-600">
                We create judgment-free environments where everyone feels comfortable sharing their experiences and seeking support.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Support</h3>
              <p className="text-gray-600">
                Connect with others who understand your journey. Our community events and peer support groups bring people together.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Education & Resources</h3>
              <p className="text-gray-600">
                Access free educational materials, guides, and resources to support your mental health journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - BetterHelp Style */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
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

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Join our community working to transform mental health awareness in Addis Ababa.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/events"
              className="inline-block bg-white text-primary-500 px-10 py-4 rounded-full font-semibold text-lg border-2 border-primary-500 hover:bg-primary-50 transition-all duration-200 shadow-sm hover:shadow-md transform rotate-2 hover:rotate-0"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
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
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md transform rotate-1 hover:rotate-0">
              <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-2">{stats.totalMembers}+</div>
              <div className="text-gray-600 font-medium">Community Members</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md transform -rotate-1 hover:rotate-0">
              <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-2">{stats.totalEvents}+</div>
              <div className="text-gray-600 font-medium">Events Hosted</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md transform rotate-1 hover:rotate-0">
              <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Free Resources</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
