'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, MapPin, Mail, Phone, Calendar } from 'lucide-react'

interface Chapter {
  id: number
  name: string
  description: string | null
  location: string | null
  address: string | null
  contactEmail: string | null
  contactPhone: string | null
  isActive: boolean
  createdAt: string
  _count: {
    events: number
  }
}

export default function AdminChaptersPage() {
  const router = useRouter()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; chapterId: number | null; chapterName: string }>({
    show: false,
    chapterId: null,
    chapterName: '',
  })

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    try {
      // Check authentication first
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/chapters', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch chapters')
      }
      const data = await response.json()
      setChapters(data)
    } catch (err) {
      setError('Failed to load chapters')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({
      show: true,
      chapterId: id,
      chapterName: name,
    })
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      show: false,
      chapterId: null,
      chapterName: '',
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.chapterId) return

    try {
      const response = await fetch(`/api/admin/chapters/${deleteConfirm.chapterId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete chapter')
      }

      setChapters(chapters.filter((c) => c.id !== deleteConfirm.chapterId))
      handleDeleteCancel()
    } catch (err: any) {
      alert(err.message || 'Failed to delete chapter')
      console.error(err)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chapters</h1>
          <p className="text-gray-600 mt-1">Manage event locations and chapters</p>
        </div>
        <Link
          href="/admin/chapters/new"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Chapter
        </Link>
      </div>

      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {chapters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No chapters yet.</p>
            <Link
              href="/admin/chapters/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Chapter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-gray-900">{chapter.name}</h3>
                    </div>
                    {chapter.isActive ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  {chapter.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{chapter.description}</p>
                  )}

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {chapter.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{chapter.location}</span>
                      </div>
                    )}
                    {chapter.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{chapter.address}</span>
                      </div>
                    )}
                    {chapter.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <a
                          href={`mailto:${chapter.contactEmail}`}
                          className="text-primary-600 hover:text-primary-700 hover:underline line-clamp-1"
                        >
                          {chapter.contactEmail}
                        </a>
                      </div>
                    )}
                    {chapter.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <a
                          href={`tel:${chapter.contactPhone}`}
                          className="text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {chapter.contactPhone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {chapter._count.events} event{chapter._count.events !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/admin/chapters/${chapter.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(chapter.id, chapter.name)}
                      className="p-2 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Chapter</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to delete <strong>"{deleteConfirm.chapterName}"</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Warning: All data will be permanently deleted</p>
                  <p className="text-sm text-red-700">
                    Note: You cannot delete a chapter that has associated events. Please remove or reassign events first.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


