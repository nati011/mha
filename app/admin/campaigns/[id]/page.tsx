'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Send, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Users,
  Calendar,
  Bell,
  Save
} from 'lucide-react'

interface Campaign {
  id: number
  name: string
  type: 'event' | 'announcement'
  message: string
  eventId: number | null
  scheduledFor: string | null
  status: 'draft' | 'scheduled' | 'sent'
  sentAt: string | null
  createdAt: string
  event?: {
    id: number
    title: string
    date: string
    time: string
    venue: string
  }
  recipients: {
    id: number
    phoneNumber: string
    name: string | null
    status: 'pending' | 'sent' | 'failed'
    sentAt: string | null
    error: string | null
    attendee?: {
      id: number
      name: string
      email: string
    }
  }[]
}

interface Attendee {
  id: number
  name: string
  email: string
  phone: string | null
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [allAttendees, setAllAttendees] = useState<Attendee[]>([])
  const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showAttendeeSelector, setShowAttendeeSelector] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    scheduledFor: '',
  })

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }

      const data = await response.json()
      setCampaign(data)
      setFormData({
        name: data.name,
        message: data.message,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor).toISOString().slice(0, 16) : '',
      })

      // If event campaign, fetch all event attendees
      if (data.eventId) {
        fetchEventAttendees(data.eventId)
      }

      // Set selected attendees from recipients
      if (data.recipients) {
        const selected = new Set(
          data.recipients
            .filter((r: any) => r.attendee)
            .map((r: any) => r.attendee.id)
        )
        setSelectedAttendees(new Set(Array.from(selected).map((id: any) => Number(id))))
      }
    } catch (err) {
      setError('Failed to load campaign')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventAttendees = async (eventId: number) => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAllAttendees(data.filter((a: Attendee) => a.phone))
      }
    } catch (err) {
      console.error('Failed to fetch attendees:', err)
    }
  }

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send campaign')
      }

      const result = await response.json()
      alert(`Campaign sent! ${result.stats.sent} messages sent, ${result.stats.failed} failed.`)
      fetchCampaign()
    } catch (err: any) {
      setError(err.message || 'Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const attendeeIds = Array.from(selectedAttendees)
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          message: formData.message,
          scheduledFor: formData.scheduledFor || null,
          attendeeIds: attendeeIds.length > 0 ? attendeeIds : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update campaign')
      }

      setEditing(false)
      fetchCampaign()
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      router.push('/admin/campaigns')
    } catch (err) {
      setError('Failed to delete campaign')
    }
  }

  const toggleAttendee = (attendeeId: number) => {
    const newSelected = new Set(selectedAttendees)
    if (newSelected.has(attendeeId)) {
      newSelected.delete(attendeeId)
    } else {
      newSelected.add(attendeeId)
    }
    setSelectedAttendees(newSelected)
  }

  const selectAll = () => {
    const allIds = new Set(allAttendees.map((a) => a.id))
    setSelectedAttendees(allIds)
  }

  const deselectAll = () => {
    setSelectedAttendees(new Set())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Campaign not found</div>
      </div>
    )
  }

  const stats = {
    total: campaign.recipients.length,
    sent: campaign.recipients.filter((r) => r.status === 'sent').length,
    failed: campaign.recipients.filter((r) => r.status === 'failed').length,
    pending: campaign.recipients.filter((r) => r.status === 'pending').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {campaign.type === 'event' ? (
                <Calendar className="w-5 h-5 text-primary-600" />
              ) : (
                <Bell className="w-5 h-5 text-blue-600" />
              )}
              <span className="text-gray-600">
                {campaign.type === 'event' ? 'Event Campaign' : 'Announcement Campaign'}
              </span>
              {campaign.status === 'sent' && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Sent
                </span>
              )}
              {campaign.status === 'scheduled' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  Scheduled
                </span>
              )}
            </div>
          </div>
          {campaign.status !== 'sent' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(!editing)}
                className="inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                <Edit className="w-5 h-5" />
                {editing ? 'Cancel Edit' : 'Edit'}
              </button>
              {campaign.status === 'draft' && (
                <button
                  onClick={handleSend}
                  disabled={sending || stats.total === 0}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {sending ? 'Sending...' : 'Send Now'}
                </button>
              )}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Details</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.message.length} / 1600 characters
                    </p>
                  </div>
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
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{campaign.message}</p>
                  </div>
                  {campaign.event && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                      <p className="text-gray-900">{campaign.event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(campaign.event.date).toLocaleDateString()} at {campaign.event.time}
                      </p>
                      <p className="text-sm text-gray-600">{campaign.event.venue}</p>
                    </div>
                  )}
                  {campaign.scheduledFor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled For</label>
                      <p className="text-gray-900">{new Date(campaign.scheduledFor).toLocaleString()}</p>
                    </div>
                  )}
                  {campaign.sentAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sent At</label>
                      <p className="text-gray-900">{new Date(campaign.sentAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recipients */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
                {campaign.status !== 'sent' && campaign.eventId && (
                  <button
                    onClick={() => setShowAttendeeSelector(!showAttendeeSelector)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showAttendeeSelector ? 'Hide' : 'Select'} Attendees
                  </button>
                )}
              </div>

              {showAttendeeSelector && campaign.eventId && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Select Attendees</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Select All
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={deselectAll}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {allAttendees.map((attendee) => (
                      <label
                        key={attendee.id}
                        className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAttendees.has(attendee.id)}
                          onChange={() => toggleAttendee(attendee.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-900">{attendee.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{attendee.phone}</span>
                      </label>
                    ))}
                  </div>
                  {selectedAttendees.size > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                      >
                        Update Recipients ({selectedAttendees.size} selected)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {stats.total === 0 ? (
                <p className="text-gray-600">No recipients added yet.</p>
              ) : (
                <div className="space-y-2">
                  {campaign.recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {recipient.status === 'sent' && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                          {recipient.status === 'failed' && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-medium text-gray-900">
                            {recipient.name || recipient.phoneNumber}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{recipient.phoneNumber}</p>
                        {recipient.error && (
                          <p className="text-xs text-red-600 mt-1">{recipient.error}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {recipient.status === 'sent' && recipient.sentAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(recipient.sentAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Recipients</div>
                </div>
                {stats.sent > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                    <div className="text-sm text-gray-600">Sent</div>
                  </div>
                )}
                {stats.failed > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                )}
                {stats.pending > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

