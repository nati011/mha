'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, QrCode } from 'lucide-react'
import QRCodeDisplay from '@/components/QRCodeDisplay'

interface Panelist {
  id?: number
  name: string
  role: string
  description: string
  image: string | null
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  endTime: string | null
  venue: string
  chapterId: number | null
  isFree: boolean
  entranceFee: number | null
  capacity: number | null
  panelists?: Panelist[]
  chapter?: {
    id: number
    name: string
    location: string | null
  } | null
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Event | null>(null)
  const [panelists, setPanelists] = useState<Panelist[]>([])
  const [chapters, setChapters] = useState<Array<{ id: number; name: string; location: string | null }>>([])

  useEffect(() => {
    if (eventId === 'new') {
      router.push('/admin/events/new')
      return
    }

    fetchEvent()
    fetchChapters()
  }, [eventId])

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/admin/chapters', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setChapters(data.filter((c: any) => c.isActive))
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err)
    }
  }

  const fetchEvent = async () => {
    try {
      // Check authentication first
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }
      const event = await response.json()
      setFormData({
        ...event,
        capacity: event.capacity || '',
        entranceFee: event.entranceFee || '',
        endTime: event.endTime || '',
        chapterId: event.chapterId || null,
      })
      setPanelists(event.panelists && event.panelists.length > 0 ? event.panelists : [{ name: '', role: '', description: '', image: null }])
    } catch (err) {
      setError('Failed to load event')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addPanelist = () => {
    setPanelists([...panelists, { name: '', role: '', description: '', image: null }])
  }

  const removePanelist = (index: number) => {
    if (panelists.length > 1) {
      setPanelists(panelists.filter((_, i) => i !== index))
    }
  }

  const updatePanelist = (index: number, field: keyof Panelist, value: string | null) => {
    const updated = [...panelists]
    updated[index] = { ...updated[index], [field]: value }
    setPanelists(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          chapterId: formData.chapterId || null,
          capacity: formData.capacity ? parseInt(String(formData.capacity)) : null,
          entranceFee: formData.isFree ? null : (formData.entranceFee ? parseFloat(String(formData.entranceFee)) : null),
          panelists: panelists.filter(p => p.name.trim() !== '' && p.role.trim() !== ''),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        throw new Error(data.error || 'Failed to update event')
      }

      router.push('/admin/events')
    } catch (err: any) {
      setError(err.message || 'Failed to update event')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Event not found</div>
      </div>
    )
  }

  const eventQRValue = typeof window !== 'undefined' 
    ? `${window.location.origin}/events/${eventId}/qr`
    : ''

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </Link>
        
        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Event QR Code</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Share this QR code to allow attendees to access the event registration page. The QR code is automatically generated when the event is created.
          </p>
          {eventQRValue && (
            <div className="flex justify-center">
              <QRCodeDisplay 
                value={eventQRValue} 
                title={formData.title}
                size={200}
                showActions={true}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Event</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                Venue * (Address or Google Maps link)
              </label>
              <input
                id="venue"
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
                placeholder="e.g., 123 Main St or https://maps.google.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can enter an address or paste a Google Maps link
              </p>
            </div>

            <div>
              <label htmlFor="chapterId" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter (optional)
              </label>
              <select
                id="chapterId"
                value={formData.chapterId || ''}
                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">No Chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}{chapter.location ? ` - ${chapter.location}` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the chapter hosting this event
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, entranceFee: e.target.checked ? null : formData.entranceFee })}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Free Event</span>
                </label>
              </div>

              {!formData.isFree && (
                <div>
                  <label htmlFor="entranceFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Entrance Fee *
                  </label>
                  <input
                    id="entranceFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.entranceFee || ''}
                    onChange={(e) => setFormData({ ...formData, entranceFee: e.target.value ? parseFloat(e.target.value) : null })}
                    required={!formData.isFree}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (optional)
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Panelists *
                </label>
                <button
                  type="button"
                  onClick={addPanelist}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Panelist
                </button>
              </div>

              <div className="space-y-4">
                {panelists.map((panelist, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Panelist {index + 1}</h4>
                      {panelists.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePanelist(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={panelist.name}
                          onChange={(e) => updatePanelist(index, 'name', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Panelist name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <input
                          type="text"
                          value={panelist.role}
                          onChange={(e) => updatePanelist(index, 'role', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Moderator, Keynote Speaker, Expert Panelist"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL (optional)
                        </label>
                        <input
                          type="url"
                          value={panelist.image || ''}
                          onChange={(e) => updatePanelist(index, 'image', e.target.value || null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={panelist.description}
                          onChange={(e) => updatePanelist(index, 'description', e.target.value)}
                          required
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Panelist bio and description"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/admin/events"
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

