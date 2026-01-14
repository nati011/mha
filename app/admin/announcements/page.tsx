'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowUp, ArrowDown } from 'lucide-react'

interface Announcement {
  id: number
  message: string
  link: string | null
  linkText: string | null
  isActive: boolean
  priority: number
  backgroundColor: string | null
  textColor: string | null
  createdAt: string
  updatedAt: string
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    message: '',
    link: '',
    linkText: '',
    isActive: true,
    priority: 0,
    backgroundColor: '',
    textColor: '',
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/announcements?includeInactive=true', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch announcements')
      }

      const data = await response.json()
      setAnnouncements(data)
    } catch (err) {
      setError('Failed to load announcements')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingId 
        ? `/api/announcements/${editingId}`
        : '/api/announcements'
      
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          link: formData.link || null,
          linkText: formData.linkText || null,
          backgroundColor: formData.backgroundColor || null,
          textColor: formData.textColor || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save announcement')
      }

      await fetchAnnouncements()
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement')
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      message: announcement.message,
      link: announcement.link || '',
      linkText: announcement.linkText || '',
      isActive: announcement.isActive,
      priority: announcement.priority,
      backgroundColor: announcement.backgroundColor || '',
      textColor: announcement.textColor || '',
    })
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return
    }

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete announcement')
      }

      setAnnouncements(announcements.filter((a) => a.id !== id))
    } catch (err) {
      alert('Failed to delete announcement')
      console.error(err)
    }
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update announcement')
      }

      await fetchAnnouncements()
    } catch (err) {
      alert('Failed to update announcement')
      console.error(err)
    }
  }

  const resetForm = () => {
    setFormData({
      message: '',
      link: '',
      linkText: '',
      isActive: true,
      priority: 0,
      backgroundColor: '',
      textColor: '',
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter announcement message..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL (optional)
                  </label>
                  <input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label htmlFor="linkText" className="block text-sm font-medium text-gray-700 mb-2">
                    Link Text (optional)
                  </label>
                  <input
                    id="linkText"
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Learn more"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Higher priority shows first</p>
                </div>
                <div>
                  <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color (optional)
                  </label>
                  <input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor || '#fef3c7'}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color (optional)
                  </label>
                  <input
                    id="textColor"
                    type="color"
                    value={formData.textColor || '#92400e'}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible on site)
                </label>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Announcement
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No announcements yet.</p>
            <p className="text-gray-500 text-sm mt-2">Create your first announcement to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {announcements.map((announcement) => (
                    <tr key={announcement.id} className={announcement.isActive ? '' : 'opacity-60'}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.message}
                        </div>
                        {announcement.link && (
                          <div className="text-xs text-gray-500 mt-1">
                            Link: {announcement.linkText || announcement.link}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {announcement.priority > 0 && (
                            <ArrowUp className="w-4 h-4 text-green-600" />
                          )}
                          {announcement.priority < 0 && (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-900">{announcement.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(announcement.id, announcement.isActive)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            announcement.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {announcement.isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="text-red-600 hover:text-red-900"
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

