'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  Globe,
  Lock,
  Users,
} from 'lucide-react'

interface Resource {
  id: number
  title: string
  description: string | null
  fileUrl: string | null
  fileType: string | null
  category: string | null
  tags: string | null
  accessLevel: string
  downloadCount: number
  createdAt: string
}

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAccess, setFilterAccess] = useState('all')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/resources?accessLevel=all', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }

      const data = await response.json()
      setResources(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return
    }

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      setResources(resources.filter((r) => r.id !== id))
    } catch (err) {
      alert('Failed to delete resource')
      console.error(err)
    }
  }

  const getFilteredResources = () => {
    let filtered = resources

    if (filterCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === filterCategory)
    }

    if (filterAccess !== 'all') {
      filtered = filtered.filter((r) => r.accessLevel === filterAccess)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query)) ||
          (r.tags && r.tags.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const categories = Array.from(new Set(resources.map((r) => r.category).filter((cat): cat is string => cat !== null)))

  const filteredResources = getFilteredResources()

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
              <p className="text-gray-600">Manage educational resources and files</p>
            </div>
            <Link
              href="/admin/resources/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Resource
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={filterAccess}
                onChange={(e) => setFilterAccess(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Access Levels</option>
                <option value="public">Public</option>
                <option value="member-only">Member Only</option>
                <option value="admin-only">Admin Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources List */}
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery || filterCategory !== 'all' || filterAccess !== 'all'
                ? 'No resources match your filters.'
                : 'No resources added yet.'}
            </p>
            <Link
              href="/admin/resources/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Resource
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{resource.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {resource.accessLevel === 'public' ? (
                      <div title="Public">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                    ) : resource.accessLevel === 'member-only' ? (
                      <div title="Members Only">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div title="Admin Only">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {resource.category && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {resource.category}
                    </span>
                  )}
                  {resource.fileType && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {resource.fileType.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{resource.downloadCount} downloads</span>
                  <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {resource.fileUrl && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

