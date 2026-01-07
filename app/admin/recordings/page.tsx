'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Video, Plus, Edit, Trash2, ExternalLink, Search, Filter } from 'lucide-react'

interface Recording {
  id: number
  title: string
  description: string | null
  url: string
  thumbnail: string | null
  duration: string | null
  eventId: number | null
  event: {
    id: number
    title: string
    date: string
  } | null
  createdAt: string
  updatedAt: string
}

export default function RecordingsPage() {
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEvent, setFilterEvent] = useState<'all' | 'with-event' | 'no-event'>('all')

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/recordings', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recordings')
      }

      const data = await response.json()
      setRecordings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return
    }

    try {
      const response = await fetch(`/api/recordings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recording')
      }

      setRecordings(recordings.filter((r) => r.id !== id))
    } catch (err) {
      alert('Failed to delete recording')
      console.error(err)
    }
  }

  const getFilteredRecordings = () => {
    let filtered = recordings

    if (filterEvent === 'with-event') {
      filtered = filtered.filter((r) => r.eventId !== null)
    } else if (filterEvent === 'no-event') {
      filtered = filtered.filter((r) => r.eventId === null)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query)) ||
          (r.event && r.event.title.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const filteredRecordings = getFilteredRecordings()

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recordings</h1>
            <p className="text-gray-600">Manage event recordings and videos</p>
          </div>
          <Link
            href="/admin/recordings/new"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Recording
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{recordings.length}</div>
            <div className="text-sm text-gray-600">Total Recordings</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {recordings.filter((r) => r.eventId !== null).length}
            </div>
            <div className="text-sm text-gray-600">Linked to Events</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {recordings.filter((r) => r.eventId === null).length}
            </div>
            <div className="text-sm text-gray-600">Standalone</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Recordings</option>
                <option value="with-event">With Event</option>
                <option value="no-event">No Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recordings List */}
        {filteredRecordings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery || filterEvent !== 'all'
                ? 'No recordings match your filters.'
                : 'No recordings yet.'}
            </p>
            <Link
              href="/admin/recordings/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Recording
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recording
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecordings.map((recording) => (
                    <tr key={recording.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {recording.thumbnail ? (
                            <img
                              src={recording.thumbnail}
                              alt={recording.title}
                              className="w-16 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-10 bg-primary-100 rounded flex items-center justify-center">
                              <Video className="w-6 h-6 text-primary-600" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{recording.title}</div>
                            {recording.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">{recording.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recording.event ? (
                          <Link
                            href={`/admin/events/${recording.event.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {recording.event.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">No event</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {recording.duration || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <a
                            href={recording.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="View Recording"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/admin/recordings/${recording.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(recording.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

