'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Star,
  Clock,
  Download,
  Plus,
  ArrowRight,
  MapPin,
} from 'lucide-react'

interface Analytics {
  eventStats: any
  memberStats: any
  blogStats: any
  campaignStats: any
  attendanceTrends: any[]
  memberGrowthTrends: any[]
  topEvents: any[]
  topBlogPosts: any[]
  eventAttendanceComparison: any[]
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  venue: string
  isFree: boolean
  attendees: { id: number }[]
  capacity: number | null
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const [analyticsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/admin/analytics?${params.toString()}`, {
          credentials: 'include',
        }),
        fetch('/api/events', {
          credentials: 'include',
        }),
      ])

      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch analytics')
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
      }

      const data = await analyticsResponse.json()
      console.log('Analytics data received:', data)
      
      // Ensure all required fields exist
      const normalizedData = {
        eventStats: data.eventStats || { total: 0, upcoming: 0, past: 0, totalAttendees: 0, totalAttended: 0, averageAttendance: 0, totalWaitlist: 0, totalFeedback: 0, averageRating: 0 },
        memberStats: data.memberStats || { total: 0, pending: 0, active: 0, declined: 0, growth: 0 },
        blogStats: data.blogStats || { total: 0, published: 0, drafts: 0, totalViews: 0, averageViews: 0 },
        campaignStats: data.campaignStats || { total: 0, sent: 0, scheduled: 0, drafts: 0, totalRecipients: 0, totalSent: 0, totalFailed: 0 },
        attendanceTrends: data.attendanceTrends || [],
        memberGrowthTrends: data.memberGrowthTrends || [],
        topEvents: data.topEvents || [],
        topBlogPosts: data.topBlogPosts || [],
        eventAttendanceComparison: data.eventAttendanceComparison || [],
      }
      
      setAnalytics(normalizedData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
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

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= now
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Failed to load analytics</div>
      </div>
    )
  }

  const memberStatusData = [
    { name: 'Active', value: analytics.memberStats.active || 0, color: '#10b981' },
    { name: 'Pending', value: analytics.memberStats.pending || 0, color: '#f59e0b' },
    { name: 'Declined', value: analytics.memberStats.declined || 0, color: '#ef4444' },
  ].filter(item => item.value > 0)

  const campaignStatusData = [
    { name: 'Sent', value: analytics.campaignStats.sent || 0, color: '#10b981' },
    { name: 'Scheduled', value: analytics.campaignStats.scheduled || 0, color: '#3b82f6' },
    { name: 'Drafts', value: analytics.campaignStats.drafts || 0, color: '#6b7280' },
  ].filter(item => item.value > 0)

  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard & Analytics</h1>
          <p className="text-gray-600">Welcome to your admin portal - Track your organization's growth and engagement metrics</p>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
                <Link
                  href="/admin/events"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {event.attendees.length}
                        {event.capacity && ` / ${event.capacity}`}
                      </div>
                      <div className="text-xs text-gray-500">Attendees</div>
                      {event.isFree && (
                        <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.eventStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.eventStats.upcoming} upcoming
                </p>
              </div>
              <Calendar className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.memberStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.memberStats.active} active
                </p>
              </div>
              <Users className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blog Posts</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.blogStats.published}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.blogStats.totalViews.toLocaleString()} total views
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campaigns Sent</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.campaignStats.sent}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.campaignStats.totalSent.toLocaleString()} messages
                </p>
              </div>
              <MessageSquare className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Trends (6 Months)</h2>
            {analytics.attendanceTrends && analytics.attendanceTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendees" stroke="#3b82f6" name="Registered" />
                  <Line type="monotone" dataKey="attended" stroke="#10b981" name="Attended" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No attendance data available</p>
              </div>
            )}
          </div>

          {/* Member Growth */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Growth (6 Months)</h2>
            {analytics.memberGrowthTrends && analytics.memberGrowthTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.memberGrowthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newMembers" fill="#3b82f6" name="New Members" />
                  <Bar dataKey="activeMembers" fill="#10b981" name="Active Members" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No member growth data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Member Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Status Distribution</h2>
            {memberStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={memberStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {memberStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No member data available</p>
              </div>
            )}
          </div>

          {/* Campaign Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Status</h2>
            {campaignStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {campaignStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No campaign data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Attendance Comparison */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Attendance: Registered vs Attended</h2>
          {analytics.eventAttendanceComparison && analytics.eventAttendanceComparison.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">No Shows</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.eventAttendanceComparison.map((event: any) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">{event.registered}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-green-600">{event.attended}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-red-600">{event.noShows}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-primary-600">{event.attendanceRate}%</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500">
              <p>No past events data available</p>
            </div>
          )}
        </div>

        {/* Top Events and Blog Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Events by Attendance</h2>
            {analytics.topEvents && analytics.topEvents.length > 0 ? (
              <div className="space-y-3">
                {analytics.topEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{event.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {event.attendees} registered • {event.attended} attended
                        {event.capacity && ` • ${event.capacity} capacity`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                <p>No events data available</p>
              </div>
            )}
          </div>

          {/* Top Blog Posts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Blog Posts by Views</h2>
            {analytics.topBlogPosts && analytics.topBlogPosts.length > 0 ? (
              <div className="space-y-3">
                {analytics.topBlogPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{post.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {post.views.toLocaleString()} views
                        {!post.published && (
                          <span className="ml-2 text-yellow-600">(Draft)</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                <p>No blog posts data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Event Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Attendance:</span>
                <span className="font-medium">{analytics.eventStats.averageAttendance.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Waitlist:</span>
                <span className="font-medium">{analytics.eventStats.totalWaitlist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Feedback:</span>
                <span className="font-medium">{analytics.eventStats.totalFeedback}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Rating:</span>
                <span className="font-medium">
                  {analytics.eventStats.averageRating > 0
                    ? analytics.eventStats.averageRating.toFixed(1)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Member Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">New (30 days):</span>
                <span className="font-medium">{analytics.memberStats.growth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Rate:</span>
                <span className="font-medium">
                  {analytics.memberStats.total > 0
                    ? ((analytics.memberStats.active / analytics.memberStats.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Campaign Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium">
                  {analytics.campaignStats.totalRecipients > 0
                    ? ((analytics.campaignStats.totalSent / analytics.campaignStats.totalRecipients) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{analytics.campaignStats.totalFailed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* No Upcoming Events - Moved to bottom */}
        {upcomingEvents.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center mt-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No upcoming events</p>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create your first event
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

