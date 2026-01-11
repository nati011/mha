'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle, QrCode, Tag, User } from 'lucide-react'
import { isUrl, extractPlaceNameFromGoogleMaps } from '@/lib/utils'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import SignatureCapture from '@/components/SignatureCanvas'

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
  chapter?: {
    id: number
    name: string
    location: string | null
  } | null
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [attendeeId, setAttendeeId] = useState<number | null>(null)
  const [showSignature, setShowSignature] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    emergencyContact: '',
    ageRange: '',
    howHeardAbout: '',
  })

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }
      const data = await response.json()
      setEvent(data)
    } catch (err) {
      setError('Failed to load event')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSignupLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          occupation: formData.occupation || null,
          emergencyContact: formData.emergencyContact || null,
          ageRange: formData.ageRange || null,
          howHeardAbout: formData.howHeardAbout || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      setAttendeeId(data.id)
      setSignupSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        occupation: '',
        emergencyContact: '',
        ageRange: '',
        howHeardAbout: '',
      })
      
      // Refresh event data to update attendee count
      fetchEvent()
    } catch (err: any) {
      setError(err.message || 'Failed to register for event')
    } finally {
      setSignupLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <Link href="/events" className="text-primary-600 hover:text-primary-700">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const isAtCapacity = event.capacity && event.attendees.length >= event.capacity
  const venueIsUrl = isUrl(event.venue)
  const placeName = venueIsUrl ? extractPlaceNameFromGoogleMaps(event.venue) : null
  
  // Check if event is past
  const eventDate = new Date(event.date)
  const now = new Date()
  const isPastEvent = event.status === 'past' || eventDate < now
  
  const eventQRValue = typeof window !== 'undefined' 
    ? `${window.location.origin}/events/${eventId}/qr`
    : ''
  
  const attendeeQRValue = attendeeId 
    ? `ATTENDEE:${attendeeId}:${eventId}`
    : ''

  const handleSaveSignature = async (sig: string) => {
    if (!attendeeId) return
    
    try {
      const response = await fetch(`/api/admin/attendees/${attendeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: sig }),
      })
      
      if (response.ok) {
        setSignature(sig)
        setShowSignature(false)
      }
    } catch (err) {
      console.error('Failed to save signature:', err)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary-50 text-gray-900 section-padding">
        <div className="container-custom">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-semibold text-gray-900">{formatDate(event.date)}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-lg mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-gray-900">
                  {event.time}
                  {event.endTime && ` - ${event.endTime}`}
                </span>
              </div>
              {event.isFree && (
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  FREE
                </span>
              )}
              {isPastEvent && (
                <span className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  PAST EVENT
                </span>
              )}
            </div>
            
            {/* Venue / Location */}
            <div className="mb-6">
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
              {/* Chapter Information (if available) */}
              {event.chapter && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Hosted by:</span>
                  <span className="text-primary-600 font-semibold">
                    {event.chapter.name}
                    {event.chapter.location && ` - ${event.chapter.location}`}
                  </span>
                </div>
              )}
            </div>
            <div className="prose max-w-none mb-6">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Panelists */}
            {event.panelists && event.panelists.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Panelists
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.panelists.map((panelist) => (
                    <div key={panelist.id} className="text-center">
                      <h4 className="text-lg font-semibold mb-3">{panelist.name}</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        {panelist.image ? (
                          <img
                            src={panelist.image}
                            alt={panelist.name}
                            className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-primary-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto border-2 border-primary-200">
                            <User className="w-8 h-8 text-primary-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Event Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {event.category && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <Tag className="w-4 h-4 text-primary-600" />
                  <span className="text-gray-900">{event.category}</span>
                </div>
              )}
              {event.tags && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-gray-900">{event.tags}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="text-gray-900">{event.attendees.length} / {event.capacity} registered</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details - Now takes less space */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 sticky top-4 space-y-6">
              {eventQRValue && !isPastEvent && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Event QR Code
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Share this QR code to access the registration form.
                  </p>
                  <QRCodeDisplay 
                    value={eventQRValue} 
                    title={event.title}
                    size={150}
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Date</div>
                      <div className="text-gray-600">{formatDate(event.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Time</div>
                      <div className="text-gray-600">
                        {event.time}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Venue</div>
                      {venueIsUrl ? (
                        <a
                          href={event.venue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <span>View on Maps</span>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      ) : (
                        <div className="text-gray-600 text-xs">{event.venue}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Attendees</div>
                      <div className="text-gray-600 text-xs">
                        {event.attendees.length} registered
                        {event.capacity && ` / ${event.capacity} capacity`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form - Now takes more space */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
              {isPastEvent ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-gray-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">This Event Has Passed</h2>
                  <p className="text-gray-600 mb-6">
                    Registration for this event is no longer available as it has already occurred.
                  </p>
                  <Link
                    href="/events"
                    className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    View Other Events
                  </Link>
                </div>
              ) : signupSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                  <p className="text-gray-600 mb-4">
                    You've successfully registered for this event. Save your QR code below for check-in.
                  </p>
                  
                  {attendeeQRValue && (
                    <div className="mb-6">
                      <QRCodeDisplay 
                        value={attendeeQRValue} 
                        title="Your Check-in QR Code"
                        size={200}
                      />
                    </div>
                  )}
                  
                  {!signature && (
                    <button
                      onClick={() => setShowSignature(true)}
                      className="w-full mb-4 px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Add Signature
                    </button>
                  )}
                  
                  {signature && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Signature saved</p>
                      <img src={signature} alt="Signature" className="max-w-full h-20 object-contain" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setSignupSuccess(false)
                      setAttendeeId(null)
                      setSignature(null)
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Register Another Person
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Register for Event</h2>
                  
                  {isAtCapacity && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
                      This event is at capacity. You can still register to be added to the waitlist.
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <select
                        id="ageRange"
                        value={formData.ageRange}
                        onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select age</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55-64">55-64</option>
                        <option value="65+">65+</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                      </label>
                      <input
                        id="occupation"
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="e.g., Teacher, Engineer, Student"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      <input
                        id="emergencyContact"
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="Name and phone number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="howHeardAbout" className="block text-sm font-medium text-gray-700 mb-1">
                        How did you hear about us?
                      </label>
                      <select
                        id="howHeardAbout"
                        value={formData.howHeardAbout}
                        onChange={(e) => setFormData({ ...formData, howHeardAbout: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Website">Website</option>
                        <option value="Friend/Family">Friend/Family</option>
                        <option value="Community Center">Community Center</option>
                        <option value="Healthcare Provider">Healthcare Provider</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={signupLoading || !!isAtCapacity}
                      className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signupLoading ? 'Registering...' : isAtCapacity ? 'Join Waitlist' : 'Register for Event'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showSignature && (
        <SignatureCapture
          onSave={handleSaveSignature}
          onCancel={() => setShowSignature(false)}
          name={formData.name}
        />
      )}
    </div>
  )
}

