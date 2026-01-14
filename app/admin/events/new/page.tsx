'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'

interface Panelist {
  name: string
  role: string
  description: string
  image: string
}

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    venue: '',
    chapterId: '',
    isFree: true,
    entranceFee: '',
    capacity: '',
    category: '',
    tags: '',
    isRecurring: false,
    recurrencePattern: '',
    recurrenceEndDate: '',
    openingNotes: '',
    closingNotes: '',
  })
  const [panelists, setPanelists] = useState<Panelist[]>([{ name: '', role: '', description: '', image: '' }])
  const [createCampaign, setCreateCampaign] = useState(false)
  const [campaignMessage, setCampaignMessage] = useState('')
  const [chapters, setChapters] = useState<Array<{ id: number; name: string; location: string | null }>>([])

  useEffect(() => {
    checkAuth()
    fetchChapters()
  }, [])

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

  const checkAuth = async () => {
    const authCheck = await fetch('/api/auth/check', {
      credentials: 'include',
    })
    
    if (!authCheck.ok) {
      router.push('/admin/login')
    }
  }

  const addPanelist = () => {
    setPanelists([...panelists, { name: '', role: '', description: '', image: '' }])
  }

  const removePanelist = (index: number) => {
    if (panelists.length > 1) {
      setPanelists(panelists.filter((_, i) => i !== index))
    }
  }

  const updatePanelist = (index: number, field: keyof Panelist, value: string) => {
    const updated = [...panelists]
    updated[index] = { ...updated[index], [field]: value }
    setPanelists(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate panelists before submission
      const validPanelists = panelists.filter(p => 
        p.name.trim() !== '' && 
        p.role.trim() !== '' && 
        p.description.trim() !== ''
      )
      if (validPanelists.length === 0) {
        setError('At least one panelist with name, role, and description is required')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Validate entrance fee for paid events
      if (!formData.isFree && (!formData.entranceFee || parseFloat(formData.entranceFee) <= 0)) {
        setError('Entrance fee is required for paid events')
        setLoading(false)
        return
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          chapterId: formData.chapterId || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          entranceFee: formData.isFree ? null : (formData.entranceFee ? parseFloat(formData.entranceFee) : null),
          endTime: formData.endTime || null,
          category: formData.category || null,
          tags: formData.tags || null,
          isRecurring: formData.isRecurring,
          recurrencePattern: formData.recurrencePattern || null,
          recurrenceEndDate: formData.recurrenceEndDate || null,
          openingNotes: formData.openingNotes || null,
          closingNotes: formData.closingNotes || null,
          panelists: validPanelists,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        throw new Error(data.error || 'Failed to create event')
      }

      const event = await response.json()

      // Create campaign if requested
      if (createCampaign && campaignMessage.trim()) {
        try {
          const campaignResponse = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: `Event Campaign - ${formData.title}`,
              type: 'event',
              message: campaignMessage,
              eventId: event.id,
            }),
          })

          if (campaignResponse.ok) {
            const campaign = await campaignResponse.json()
            router.push(`/admin/campaigns/${campaign.id}`)
            return
          }
        } catch (err) {
          console.error('Failed to create campaign:', err)
          // Continue to events page even if campaign creation fails
        }
      }

      router.push('/admin/events')
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      setLoading(false)
    }
  }

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
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>

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
                  value={formData.endTime}
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
                value={formData.chapterId}
                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, entranceFee: e.target.checked ? '' : formData.entranceFee })}
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
                    value={formData.entranceFee}
                    onChange={(e) => setFormData({ ...formData, entranceFee: e.target.value })}
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
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                          value={panelist.image}
                          onChange={(e) => updatePanelist(index, 'image', e.target.value)}
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

            {/* Opening and Closing Notes */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Notes</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="openingNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Notes (optional)
                  </label>
                  <textarea
                    id="openingNotes"
                    value={formData.openingNotes}
                    onChange={(e) => setFormData({ ...formData, openingNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add opening notes or announcements for this event..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    These notes will appear at the beginning of the event detail page
                  </p>
                </div>
                <div>
                  <label htmlFor="closingNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Notes (optional)
                  </label>
                  <textarea
                    id="closingNotes"
                    value={formData.closingNotes}
                    onChange={(e) => setFormData({ ...formData, closingNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add closing notes or follow-up information for this event..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    These notes will appear at the end of the event detail page
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Creation Option */}
            <div className="pt-6 border-t border-gray-200">
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createCampaign}
                    onChange={(e) => setCreateCampaign(e.target.checked)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Create SMS Campaign for this Event
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Create a campaign to send SMS notifications to attendees about this event
                </p>
              </div>

              {createCampaign && (
                <div className="ml-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Message *
                  </label>
                  <textarea
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    required={createCampaign}
                    rows={4}
                    maxLength={1600}
                    placeholder="Enter your SMS message for event attendees..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {campaignMessage.length} / 1600 characters. You can select specific attendees after creating the campaign.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
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

