'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Eye,
  Check,
  X,
  ExternalLink,
  Users
} from 'lucide-react'

interface Member {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  dateOfBirth: string | null
  address: string | null
  city: string | null
  occupation: string | null
  education: string | null
  interests: string | null
  motivation: string
  experience: string | null
  availability: string | null
  skills: string | null
  status: 'pending' | 'active' | 'declined'
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  volunteer?: {
    id: number
    status: string
  } | null
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'declined'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [showVolunteerModal, setShowVolunteerModal] = useState(false)
  const [volunteerData, setVolunteerData] = useState({ roles: '', skills: '', availability: '' })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/members', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()
      setMembers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (member: Member) => {
    setSelectedMember(member)
    setNotes(member.notes || '')
    setShowModal(true)
  }

  const handleAccept = async (memberId: number, reviewNotes?: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/members/${memberId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notes: reviewNotes || notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept member')
      }

      setShowModal(false)
      fetchMembers()
    } catch (err) {
      alert('Failed to accept member')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async (memberId: number, reviewNotes?: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/members/${memberId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notes: reviewNotes || notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to decline member')
      }

      setShowModal(false)
      fetchMembers()
    } catch (err) {
      alert('Failed to decline member')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMakeVolunteer = async (member: Member) => {
    if (member.status !== 'active') {
      alert('Only active members can become volunteers')
      return
    }

    if (member.volunteer) {
      alert('This member is already a volunteer')
      return
    }

    setSelectedMember(member)
    setVolunteerData({
      roles: '',
      skills: member.skills || '',
      availability: member.availability || '',
    })
    setShowVolunteerModal(true)
  }

  const handleCreateVolunteer = async () => {
    if (!selectedMember) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          memberId: selectedMember.id,
          roles: volunteerData.roles || null,
          skills: volunteerData.skills || null,
          availability: volunteerData.availability || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create volunteer')
      }

      setShowVolunteerModal(false)
      setSelectedMember(null)
      setVolunteerData({ roles: '', skills: '', availability: '' })
      fetchMembers()
      alert('Member successfully added as volunteer!')
    } catch (err: any) {
      alert(err.message || 'Failed to create volunteer')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const getFilteredMembers = () => {
    let filtered = members

    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) => m.status === filterStatus)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          (m.occupation && m.occupation.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => {
      // Pending first, then by date
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        )
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      default:
        return null
    }
  }

  const stats = {
    total: members.length,
    pending: members.filter((m) => m.status === 'pending').length,
    active: members.filter((m) => m.status === 'active').length,
    declined: members.filter((m) => m.status === 'declined').length,
  }

  const filteredMembers = getFilteredMembers()

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Management</h1>
          <p className="text-gray-600">
            Review and manage membership applications. Accept or decline pending requests.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or occupation..."
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
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all'
                ? 'No members match your filters.'
                : 'No membership applications yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className={`hover:bg-gray-50 ${
                        member.status === 'pending' ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        {member.occupation && (
                          <div className="text-sm text-gray-500">{member.occupation}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          {member.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {member.city}
                            </div>
                          )}
                          {member.education && (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {member.education}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(member.status)}
                        {member.reviewedBy && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reviewed by {member.reviewedBy}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.volunteer ? (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Volunteer
                          </span>
                        ) : member.status === 'active' ? (
                          <span className="text-xs text-gray-500">Not a volunteer</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewClick(member)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {member.status === 'active' && (
                            <>
                              {!member.volunteer && (
                                <button
                                  onClick={() => handleMakeVolunteer(member)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Make Volunteer"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                              )}
                              <a
                                href={`/profile?email=${encodeURIComponent(member.email)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                                title="View Profile"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </>
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

      {/* Member Detail Modal */}
      {selectedMember && showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedMember.firstName} {selectedMember.lastName}
              </h2>
              <button
                onClick={() => {
                  setSelectedMember(null)
                  setShowModal(false)
                  setNotes('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedMember.status)}
                {selectedMember.reviewedAt && (
                  <span className="text-sm text-gray-500">
                    Reviewed on {new Date(selectedMember.reviewedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>
                  {selectedMember.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedMember.phone}</p>
                    </div>
                  )}
                  {selectedMember.city && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="text-gray-900">{selectedMember.city}</p>
                    </div>
                  )}
                  {selectedMember.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">{selectedMember.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              {(selectedMember.occupation || selectedMember.education) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedMember.occupation && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occupation</label>
                        <p className="text-gray-900">{selectedMember.occupation}</p>
                      </div>
                    )}
                    {selectedMember.education && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Education</label>
                        <p className="text-gray-900">{selectedMember.education}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Motivation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Motivation</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedMember.motivation}</p>
              </div>

              {/* Experience */}
              {selectedMember.experience && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMember.experience}</p>
                </div>
              )}

              {/* Skills */}
              {selectedMember.skills && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMember.skills}</p>
                </div>
              )}

              {/* Interests */}
              {selectedMember.interests && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMember.interests}</p>
                </div>
              )}

              {/* Availability */}
              {selectedMember.availability && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMember.availability}</p>
                </div>
              )}

              {/* Notes */}
              {selectedMember.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMember.notes}</p>
                </div>
              )}

              {/* Actions for Pending */}
              {selectedMember.status === 'pending' && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add notes about this application..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAccept(selectedMember.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Accept Member
                    </button>
                    <button
                      onClick={() => handleDecline(selectedMember.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Make Volunteer Modal */}
      {selectedMember && showVolunteerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Make {selectedMember.firstName} {selectedMember.lastName} a Volunteer
              </h2>
              <button
                onClick={() => {
                  setShowVolunteerModal(false)
                  setSelectedMember(null)
                  setVolunteerData({ roles: '', skills: '', availability: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles (comma-separated)
                </label>
                <input
                  type="text"
                  value={volunteerData.roles}
                  onChange={(e) => setVolunteerData({ ...volunteerData, roles: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Event Coordinator, Outreach, Social Media"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={volunteerData.skills}
                  onChange={(e) => setVolunteerData({ ...volunteerData, skills: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Public Speaking, Graphic Design, Event Planning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <textarea
                  value={volunteerData.availability}
                  onChange={(e) => setVolunteerData({ ...volunteerData, availability: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Weekends, Evenings, Flexible"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreateVolunteer}
                  disabled={actionLoading}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Create Volunteer
                </button>
                <button
                  onClick={() => {
                    setShowVolunteerModal(false)
                    setSelectedMember(null)
                    setVolunteerData({ roles: '', skills: '', availability: '' })
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

