'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MessageSquare, FileText, ArrowLeft, CheckCircle, Clock, MapPin, Users, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { isUrl, extractPlaceNameFromGoogleMaps } from '@/lib/utils'

interface Panelist {
  id: number
  name: string
  role: string
  description: string | null
  image: string | null
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  endTime?: string | null
  venue: string
  isFree: boolean
  capacity: number | null
  attendees: { id: number }[]
  status?: string
  panelists?: Panelist[]
  category?: string | null
  tags?: string | null
  openingNotes?: string | null
  closingNotes?: string | null
}

export default function EventQRPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [activeOption, setActiveOption] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    } else {
      setError('Invalid event ID')
      setLoading(false)
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      if (!eventId || isNaN(Number.parseInt(eventId))) {
        setError('Invalid event ID')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const response = await fetch(`/api/events/${eventId}`)
      
      if (response.status === 404) {
        setError('Event not found')
        setLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to load event')
        setLoading(false)
        return
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      
      setEvent(data)
      setError('')
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to load event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleAttend = () => {
    router.push(`/events/${eventId}`)
  }

  const handleQuestions = () => {
    setActiveOption('questions')
  }

  const handleComments = () => {
    setActiveOption('comments')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const message = formData.get('message') as string
    const type = activeOption

    try {
      const response = await fetch(`/api/events/${eventId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setActiveOption(null)
          setSubmitted(false)
        }, 3000)
      } else {
        alert('Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('An error occurred. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!loading && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <Link href="/events" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your {activeOption === 'questions' ? 'question' : 'comment'} has been submitted successfully.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <Link href="/events" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const venueIsUrl = isUrl(event.venue)
  const placeName = venueIsUrl ? extractPlaceNameFromGoogleMaps(event.venue) : null
  const eventDate = new Date(event.date)
  const now = new Date()
  const isPastEvent = event.status === 'past' || eventDate < now

  if (activeOption) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <button
            onClick={() => setActiveOption(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {activeOption === 'questions' ? 'Ask a Question' : 'Leave a Comment'}
          </h2>
          <p className="text-gray-600 mb-6">
            {activeOption === 'questions' 
              ? 'Have a question about this event? We\'d love to help!'
              : 'Share your thoughts or feedback about this event.'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {activeOption === 'questions' ? 'Your Question' : 'Your Comment'}
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder={activeOption === 'questions' 
                  ? 'Type your question here...'
                  : 'Type your comment here...'}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveOption(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Event Details Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-primary-600" />
            <span className="text-xl font-semibold text-gray-900">{formatDate(event.date)}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{event.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900">
                {event.time}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
            {event.isFree && (
              <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                FREE
              </span>
            )}
            {isPastEvent && (
              <span className="bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                PAST EVENT
              </span>
            )}
          </div>

          {/* Venue */}
          <div className="mb-4">
            {venueIsUrl ? (
              <div>
                {placeName && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <span className="text-lg font-semibold text-gray-900">{placeName}</span>
                  </div>
                )}
                <a
                  href={event.venue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 hover:underline text-base font-medium"
                >
                  <span>View on Maps</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span className="text-lg text-gray-900">{event.venue}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-6">
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Opening Notes */}
          {event.openingNotes && (
            <div className="mb-6 bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Opening Notes</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.openingNotes}</p>
            </div>
          )}

          {/* Panelists */}
          {event.panelists && event.panelists.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Panelists
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.panelists.map((panelist) => (
                  <div key={panelist.id} className="text-center bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    {panelist.image ? (
                      <img
                        src={panelist.image}
                        alt={panelist.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-primary-200 mb-3"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto border-2 border-primary-200 mb-3">
                        <User className="w-8 h-8 text-primary-600" />
                      </div>
                    )}
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{panelist.name}</h4>
                    {panelist.role && (
                      <p className="text-primary-600 text-sm font-medium mb-2">{panelist.role}</p>
                    )}
                    {panelist.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{panelist.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Event Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {event.category && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <Tag className="w-4 h-4 text-primary-600" />
                <span className="text-gray-900">{event.category}</span>
              </div>
            )}
            {event.tags && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <span className="text-gray-900">{event.tags}</span>
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="text-gray-900">{event.attendees.length} / {event.capacity} registered</span>
              </div>
            )}
          </div>

          {/* Closing Notes */}
          {event.closingNotes && (
            <div className="mt-6 bg-secondary-50 border-l-4 border-secondary-400 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Closing Notes</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.closingNotes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Options</h2>
            <p className="text-gray-600">Choose what you'd like to do</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleAttend}
              className="w-full flex items-center gap-4 p-6 bg-transparent border-2 border-green-500 text-gray-900 rounded-xl hover:border-green-600 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold mb-1">Attend Event</h3>
                <p className="text-sm text-gray-600">Register for this event</p>
              </div>
            </button>

            <button
              onClick={handleQuestions}
              className="w-full flex items-center gap-4 p-6 bg-transparent border-2 border-green-500 text-gray-900 rounded-xl hover:border-green-600 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold mb-1">Questions</h3>
                <p className="text-sm text-gray-600">Ask a question about this event</p>
              </div>
            </button>

            <button
              onClick={handleComments}
              className="w-full flex items-center gap-4 p-6 bg-transparent border-2 border-green-500 text-gray-900 rounded-xl hover:border-green-600 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold mb-1">Comments</h3>
                <p className="text-sm text-gray-600">Share your thoughts or feedback</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

