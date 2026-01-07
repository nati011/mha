'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'

interface Event {
  id: number
  title: string
  date: string
}

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignType = searchParams.get('type') || 'event'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [formData, setFormData] = useState({
    name: '',
    type: campaignType as 'event' | 'announcement',
    message: '',
    eventId: '',
    scheduledFor: '',
  })

  useEffect(() => {
    checkAuth()
    if (campaignType === 'event') {
      fetchEvents()
    }
  }, [campaignType])

  const checkAuth = async () => {
    const authCheck = await fetch('/api/auth/check', {
      credentials: 'include',
    })
    
    if (!authCheck.ok) {
      router.push('/admin/login')
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.message) {
        throw new Error('Name and message are required')
      }

      if (formData.type === 'event' && !formData.eventId) {
        throw new Error('Please select an event')
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          message: formData.message,
          eventId: formData.eventId || null,
          scheduledFor: formData.scheduledFor || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create campaign')
      }

      const campaign = await response.json()
      router.push(`/admin/campaigns/${campaign.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create {formData.type === 'event' ? 'Event' : 'Announcement'} Campaign
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'event' | 'announcement' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="event">Event</option>
                <option value="announcement">Announcement / Holiday</option>
              </select>
            </div>

            {/* Event Selection (only for event type) */}
            {formData.type === 'event' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event *
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  required={formData.type === 'event'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Event Reminder - Spring Workshop"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                maxLength={1600}
                placeholder="Enter your SMS message here (max 1600 characters)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.message.length} / 1600 characters (SMS messages are typically 160 characters per message)
              </p>
            </div>

            {/* Scheduled For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Send (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to save as draft and send manually later
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
              <Link
                href="/admin/campaigns"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

