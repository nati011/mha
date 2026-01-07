'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react'

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  venue: string
  capacity: number | null
  attendees: { id: number; attended: boolean }[]
}

export default function AttendanceManagementPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/events', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getFilteredEvents = () => {
    let filtered = events

    // Filter by date
    const now = new Date()
    if (filterType === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.date) >= now)
    } else if (filterType === 'past') {
      filtered = filtered.filter((event) => new Date(event.date) < now)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      )
    }

    // Sort by date (upcoming first, then past)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      const nowTime = now.getTime()
      
      // If both are upcoming or both are past, sort by date
      if ((dateA >= nowTime && dateB >= nowTime) || (dateA < nowTime && dateB < nowTime)) {
        return dateA - dateB
      }
      // Upcoming events first
      return dateB - dateA
    })
  }

  const getAttendanceStats = (event: Event) => {
    const totalAttendees = event.attendees.length
    const attendedCount = event.attendees.filter((a) => a.attended).length
    const attendanceRate = totalAttendees > 0 ? (attendedCount / totalAttendees) * 100 : 0
    const remainingCapacity = event.capacity ? event.capacity - totalAttendees : null

    return {
      totalAttendees,
      attendedCount,
      attendanceRate,
      remainingCapacity,
    }
  }

  const filteredEvents = getFilteredEvents()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">
            Manage attendance for all events. Track registrations and check-ins.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, venue, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'upcoming' | 'past')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all'
                ? 'No events match your filters.'
                : 'No events found.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const stats = getAttendanceStats(event)
              const isUpcoming = new Date(event.date) >= new Date()
              const isPast = new Date(event.date) < new Date()

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Event Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stats.totalAttendees}
                          </div>
                          <div className="text-xs text-gray-500">Registered</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {stats.attendedCount}
                          </div>
                          <div className="text-xs text-gray-500">Attended</div>
                        </div>
                      </div>

                      {/* Attendance Rate Bar */}
                      {stats.totalAttendees > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Attendance Rate</span>
                            <span className="font-semibold text-gray-900">
                              {stats.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${stats.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Capacity Info */}
                      {event.capacity && (
                        <div className="text-xs text-gray-600 mt-2">
                          Capacity: {stats.totalAttendees} / {event.capacity}
                          {stats.remainingCapacity !== null && stats.remainingCapacity > 0 && (
                            <span className="text-green-600 ml-1">
                              ({stats.remainingCapacity} spots remaining)
                            </span>
                          )}
                          {stats.remainingCapacity === 0 && (
                            <span className="text-red-600 ml-1">(Full)</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      {isUpcoming && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          Upcoming
                        </span>
                      )}
                      {isPast && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                          Past Event
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/admin/events/${event.id}/attendees`}
                      className="block w-full bg-primary-500 text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Manage Attendance</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        {events.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {events.filter((e) => new Date(e.date) >= new Date()).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {events.reduce((sum, e) => sum + e.attendees.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Registrations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {events.reduce((sum, e) => sum + e.attendees.filter((a) => a.attended).length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Attended</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

