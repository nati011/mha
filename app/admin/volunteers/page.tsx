'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Briefcase,
  Calendar,
} from 'lucide-react'

interface Volunteer {
  id: number
  roles: string | null
  skills: string | null
  availability: string | null
  hoursWorked: number
  status: string
  joinedAt: string
  member: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string | null
    profilePicture: string | null
  }
  assignments: {
    id: number
    task: string
    role: string
    status: string
    hours: number | null
    assignedAt: string
  }[]
}

export default function VolunteersPage() {
  const router = useRouter()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all')

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/volunteers', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch volunteers')
      }

      const data = await response.json()
      setVolunteers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredVolunteers = () => {
    let filtered = volunteers

    if (filterStatus !== 'all') {
      filtered = filtered.filter((v) => v.status === filterStatus)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.member.firstName.toLowerCase().includes(query) ||
          v.member.lastName.toLowerCase().includes(query) ||
          v.member.email.toLowerCase().includes(query) ||
          (v.roles && v.roles.toLowerCase().includes(query)) ||
          (v.skills && v.skills.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  const filteredVolunteers = getFilteredVolunteers()
  const totalHours = volunteers.reduce((sum, v) => sum + v.hoursWorked, 0)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Management</h1>
          <p className="text-gray-600">Manage volunteers and their assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{volunteers.length}</div>
            <div className="text-sm text-gray-600">Total Volunteers</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {volunteers.filter((v) => v.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {volunteers.reduce((sum, v) => sum + v.assignments.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Assignments</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Volunteers List */}
        {filteredVolunteers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'No volunteers match your filters.'
                : 'No volunteers yet.'}
            </p>
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Volunteer from Members
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles & Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {volunteer.member.profilePicture ? (
                            <img
                              src={volunteer.member.profilePicture}
                              alt={`${volunteer.member.firstName} ${volunteer.member.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-semibold text-sm">
                                {volunteer.member.firstName[0]}{volunteer.member.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {volunteer.member.firstName} {volunteer.member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{volunteer.member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {volunteer.roles && (
                            <div className="mb-1">
                              <span className="font-medium">Roles:</span> {volunteer.roles}
                            </div>
                          )}
                          {volunteer.skills && (
                            <div className="text-gray-600">
                              <span className="font-medium">Skills:</span> {volunteer.skills}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {volunteer.hoursWorked.toFixed(1)} hrs
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {volunteer.assignments.length} total
                        </div>
                        <div className="text-xs text-gray-500">
                          {volunteer.assignments.filter((a) => a.status === 'completed').length} completed
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          volunteer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : volunteer.status === 'on-leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {volunteer.status}
                        </span>
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

