'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Users, Calendar, Clock, MapPin, MessageSquare } from 'lucide-react'
import { isUrl } from '@/lib/utils'

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  venue: string
  isFree: boolean
  capacity: number | null
  attendees: { id: number }[]
  feedback?: {
    type: string
  }[]
}

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: number | null; eventTitle: string }>({
    show: false,
    eventId: null,
    eventTitle: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Check authentication first
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/events')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError('Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteConfirm({
      show: true,
      eventId: id,
      eventTitle: title,
    })
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      show: false,
      eventId: null,
      eventTitle: '',
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.eventId) return

    try {
      const response = await fetch(`/api/events/${deleteConfirm.eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to delete event')
      }

      setEvents(events.filter((e) => e.id !== deleteConfirm.eventId))
      handleDeleteCancel()
    } catch (err) {
      alert('Failed to delete event')
      console.error(err)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Manage all your events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Event
        </Link>
      </div>

      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No events yet.</p>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold text-sm">{formatDate(event.date)}</span>
                    </div>
                    {event.isFree && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        FREE
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {isUrl(event.venue) ? (
                        <a
                          href={event.venue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline line-clamp-1 inline-flex items-center gap-1"
                        >
                          <span>View on Maps</span>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      ) : (
                        <span className="line-clamp-1">{event.venue}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        {event.capacity && ` / ${event.capacity} capacity`}
                      </span>
                    </div>
                    {event.feedback && event.feedback.length > 0 && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {event.feedback.filter((f: any) => f.type === 'question').length} question{event.feedback.filter((f: any) => f.type === 'question').length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {event.feedback.filter((f: any) => f.type === 'comment').length} comment{event.feedback.filter((f: any) => f.type === 'comment').length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/admin/events/${event.id}/attendees`}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <Users className="w-4 h-4" />
                      Attendees
                    </Link>
                    {event.feedback && event.feedback.length > 0 && (
                      <Link
                        href={`/admin/events/${event.id}/feedback`}
                        className="flex-1 inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                      </Link>
                    )}
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(event.id, event.title)}
                      className="p-2 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Event</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to delete <strong>"{deleteConfirm.eventTitle}"</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Warning: All data will be permanently deleted</p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>All attendee registrations</li>
                    <li>All feedback and comments</li>
                    <li>All waitlist entries</li>
                    <li>All event data and settings</li>
                  </ul>
                  <p className="text-sm text-red-800 font-semibold mt-3">
                    This action is irreversible and all associated data will be wiped.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

