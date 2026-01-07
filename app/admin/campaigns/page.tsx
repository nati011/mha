'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageSquare, 
  Plus, 
  Calendar,
  Bell,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight
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
  }
  recipients?: {
    id: number
    status: string
  }[]
}

interface Event {
  id: number
  title: string
  date: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'event' | 'announcement'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const [campaignsResponse, eventsResponse] = await Promise.all([
        fetch('/api/campaigns', { credentials: 'include' }),
        fetch('/api/events', { credentials: 'include' }),
      ])

      if (!campaignsResponse.ok || !eventsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const campaignsData = await campaignsResponse.json()
      const eventsData = await eventsResponse.json()

      setCampaigns(campaignsData)
      setEvents(eventsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredCampaigns = () => {
    let filtered = campaigns

    if (filterType !== 'all') {
      filtered = filtered.filter((c) => c.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.message.toLowerCase().includes(query) ||
          c.event?.title.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Sent
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
            Draft
          </span>
        )
      default:
        return null
    }
  }

  const getRecipientStats = (campaign: Campaign) => {
    if (!campaign.recipients || campaign.recipients.length === 0) {
      return { total: 0, sent: 0, failed: 0 }
    }
    const total = campaign.recipients.length
    const sent = campaign.recipients.filter((r) => r.status === 'sent').length
    const failed = campaign.recipients.filter((r) => r.status === 'failed').length
    return { total, sent, failed }
  }

  const filteredCampaigns = getFilteredCampaigns()

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS Campaigns</h1>
              <p className="text-gray-600">
                Create and manage SMS campaigns for events, announcements, and holidays.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/campaigns/new?type=announcement"
                className="inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                New Announcement
              </Link>
              <Link
                href="/admin/campaigns/new?type=event"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="event">Events</option>
                <option value="announcement">Announcements</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
            </select>
          </div>
        </div>

        {/* Campaigns List */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'No campaigns match your filters.'
                : 'No campaigns created yet.'}
            </p>
            <Link
              href="/admin/campaigns/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const stats = getRecipientStats(campaign)
              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {campaign.type === 'event' ? (
                            <Calendar className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Bell className="w-5 h-5 text-blue-600" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {campaign.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(campaign.status)}
                          <span className="text-xs text-gray-500">
                            {campaign.type === 'event' ? 'Event' : 'Announcement'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    {campaign.event && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-900">{campaign.event.title}</p>
                      </div>
                    )}

                    {/* Message Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">{campaign.message}</p>
                    </div>

                    {/* Stats */}
                    {stats.total > 0 && (
                      <div className="mb-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{stats.sent}</div>
                            <div className="text-xs text-gray-500">Sent</div>
                          </div>
                          {stats.failed > 0 && (
                            <div>
                              <div className="text-lg font-bold text-red-600">{stats.failed}</div>
                              <div className="text-xs text-gray-500">Failed</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="mb-4 text-xs text-gray-500 space-y-1">
                      {campaign.scheduledFor && (
                        <div>
                          Scheduled: {new Date(campaign.scheduledFor).toLocaleString()}
                        </div>
                      )}
                      {campaign.sentAt && (
                        <div>
                          Sent: {new Date(campaign.sentAt).toLocaleString()}
                        </div>
                      )}
                      <div>
                        Created: {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/admin/campaigns/${campaign.id}`}
                      className="block w-full bg-primary-500 text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

