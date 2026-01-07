'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Clock,
  Download,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface Attendee {
  id: number
  name: string
  email: string
  phone: string | null
  occupation: string | null
  emergencyContact: string | null
  ageRange: string | null
  howHeardAbout: string | null
  attended: boolean
  attendedAt: string | null
  createdAt: string
  event: {
    id: number
    title: string
    date: string
    time: string
    venue: string
  }
}

export default function AllAttendeesPage() {
  const router = useRouter()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUnique, setShowUnique] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    unique: 0,
  })

  useEffect(() => {
    fetchData()
  }, [showUnique])

  const fetchData = async () => {
    try {
      // Check authentication first
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/admin/attendees?unique=${showUnique}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch attendees')
      }

      const data = await response.json()
      setAttendees(data)
      
      // Calculate stats
      const uniqueEmails = new Set(data.map((a: Attendee) => a.email))
      setStats({
        total: data.length,
        unique: uniqueEmails.size,
      })
    } catch (err) {
      setError('Failed to load attendees')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Event',
      'Event Date',
      'Event Time',
      'Venue',
      'Occupation',
      'Emergency Contact',
      'Age',
      'How Heard About',
      'Attended At',
      'Registered At',
    ]

    const rows = attendees.map((a) => [
      a.name,
      a.email,
      a.phone || '',
      a.event.title,
      a.event.date,
      a.event.time,
      a.event.venue,
      a.occupation || '',
      a.emergencyContact || '',
      a.ageRange || '',
      a.howHeardAbout || '',
      a.attendedAt ? new Date(a.attendedAt).toLocaleString() : '',
      new Date(a.createdAt).toLocaleString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all_attendees_${showUnique ? 'unique' : 'all'}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendee Management</h1>
          <p className="text-gray-600">
            View all attendees who have ever attended events
          </p>
        </div>

        {/* Stats and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unique}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnique}
                  onChange={(e) => setShowUnique(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show unique only (by email)</span>
              </label>
              {attendees.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {attendees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No attendees have been marked as attended yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Use the event attendees page to sign in attendees.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Additional Info
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                        {attendee.ageRange && (
                          <div className="text-sm text-gray-500">{attendee.ageRange}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {attendee.email}
                        </div>
                        {attendee.phone && (
                          <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {attendee.phone}
                          </div>
                        )}
                        {attendee.emergencyContact && (
                          <div className="text-xs text-gray-500 mt-1">
                            Emergency: {attendee.emergencyContact}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <Link
                            href={`/admin/events/${attendee.event.id}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {attendee.event.title}
                          </Link>
                          <div className="text-gray-600 mt-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(attendee.event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{attendee.event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{attendee.event.venue}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {attendee.attended ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">Attended</div>
                                {attendee.attendedAt && (
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(attendee.attendedAt)}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-500">Not attended</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          {attendee.occupation && (
                              <div>
                                <span className="font-medium">Occupation:</span> {attendee.occupation}
                              </div>
                            )}
                          {attendee.howHeardAbout && (
                            <div>
                              <span className="font-medium">Heard via:</span> {attendee.howHeardAbout}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

