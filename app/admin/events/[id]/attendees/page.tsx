'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Mail, Phone, CheckCircle2, Clock, Plus, Edit, Trash2, X, Search, QrCode, Upload } from 'lucide-react'
import QRScanner from '@/components/QRScanner'
import * as XLSX from 'xlsx'

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
  signature: string | null
  createdAt: string
}

interface Event {
  id: number
  title: string
  capacity: number | null
}

export default function EventAttendeesPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [importing, setImporting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    emergencyContact: '',
    ageRange: '',
    howHeardAbout: '',
  })

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      const [eventResponse, attendeesResponse] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/attendees`, {
          credentials: 'include',
        }),
      ])

      if (!eventResponse.ok || !attendeesResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const eventData = await eventResponse.json()
      const attendeesData = await attendeesResponse.json()

      setEvent(eventData)
      setAttendees(attendeesData)
    } catch (err) {
      setError('Failed to load attendees')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAttendance = async (attendeeId: number, currentStatus: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(attendeeId))
    
    try {
      const response = await fetch(`/api/admin/attendees/${attendeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ attended: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update attendance')
      }

      const updatedAttendee = await response.json()
      
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendeeId ? updatedAttendee : a))
      )
      setError('')
    } catch (err) {
      setError('Failed to update attendance')
      console.error(err)
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(attendeeId)
        return next
      })
    }
  }

  const handleOpenAddModal = () => {
    setEditingAttendee(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      occupation: '',
      emergencyContact: '',
      ageRange: '',
      howHeardAbout: '',
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (attendee: Attendee) => {
    setEditingAttendee(attendee)
    setFormData({
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone || '',
      occupation: attendee.occupation || '',
      emergencyContact: attendee.emergencyContact || '',
      ageRange: attendee.ageRange || '',
      howHeardAbout: attendee.howHeardAbout || '',
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAttendee(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      occupation: '',
      emergencyContact: '',
      ageRange: '',
      howHeardAbout: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (editingAttendee) {
        // Update existing attendee
        const response = await fetch(`/api/admin/attendees/${editingAttendee.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            occupation: formData.occupation || null,
            emergencyContact: formData.emergencyContact || null,
            ageRange: formData.ageRange || null,
            howHeardAbout: formData.howHeardAbout || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update attendee')
        }

        const updatedAttendee = await response.json()
        setAttendees((prev) =>
          prev.map((a) => (a.id === editingAttendee.id ? updatedAttendee : a))
        )
      } else {
        // Add new attendee
        const response = await fetch(`/api/events/${eventId}/attendees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            occupation: formData.occupation || null,
            emergencyContact: formData.emergencyContact || null,
            ageRange: formData.ageRange || null,
            howHeardAbout: formData.howHeardAbout || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add attendee')
        }

        const newAttendee = await response.json()
        setAttendees((prev) => [newAttendee, ...prev])
      }

      handleCloseModal()
    } catch (err: any) {
      setError(err.message || 'Failed to save attendee')
      console.error(err)
    }
  }

  const handleDelete = async (attendeeId: number) => {
    if (!confirm('Are you sure you want to delete this attendee?')) {
      return
    }

    setUpdatingIds((prev) => new Set(prev).add(attendeeId))

    try {
      const response = await fetch(`/api/admin/attendees/${attendeeId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete attendee')
      }

      setAttendees((prev) => prev.filter((a) => a.id !== attendeeId))
      setError('')
    } catch (err) {
      setError('Failed to delete attendee')
      console.error(err)
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(attendeeId)
        return next
      })
    }
  }

  const handleExcelImport = async (file: File) => {
    setImporting(true)
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(firstSheet) as any[]

      if (data.length === 0) {
        throw new Error('Excel file is empty')
      }

      // Validate and map Excel columns to attendee fields
      // Expected columns: Name, Email, Phone, Occupation (optional), Emergency Contact (optional), Age Range (optional), How Heard About (optional)
      const attendeesToImport = data.map((row, index) => {
        const name = row['Name'] || row['name'] || row['NAME']
        const email = row['Email'] || row['email'] || row['EMAIL']
        const phone = row['Phone'] || row['phone'] || row['PHONE'] || row['Phone Number'] || row['phone number']

        if (!name || !email || !phone) {
          throw new Error(`Row ${index + 2}: Missing required fields (Name, Email, Phone)`)
        }

        return {
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          occupation: row['Occupation'] || row['occupation'] || null,
          emergencyContact: row['Emergency Contact'] || row['emergency contact'] || row['EmergencyContact'] || null,
          ageRange: row['Age Range'] || row['age range'] || row['AgeRange'] || row['Age'] || null,
          howHeardAbout: row['How Heard About'] || row['how heard about'] || row['HowHeardAbout'] || null,
        }
      })

      // Send to API for bulk import
      const response = await fetch(`/api/events/${eventId}/attendees/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ attendees: attendeesToImport }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to import attendees')
      }

      const result = await response.json()
      
      // Refresh attendees list
      await fetchData()
      
      const skippedMsg = result.skipped > 0 ? `${result.skipped} duplicates skipped.` : ''
      alert(`Successfully imported ${result.created} attendees. ${skippedMsg}`)
    } catch (err: any) {
      setError(err.message || 'Failed to import attendees from Excel')
      console.error(err)
    } finally {
      setImporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setError('Please select a valid Excel file (.xlsx or .xls)')
        return
      }
      handleExcelImport(file)
    }
  }

  const handleQRScan = async (qrData: string) => {
    try {
      const response = await fetch('/api/admin/attendees/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ qrData }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to scan QR code')
      }

      const scannedAttendee = await response.json()

      // Verify it's for this event
      if (scannedAttendee.eventId !== Number.parseInt(eventId)) {
        alert('This QR code is for a different event')
        return
      }

      // Find and highlight the attendee
      const attendee = attendees.find((a) => a.id === scannedAttendee.id)
      if (attendee) {
        // Mark as attended if not already
        if (!attendee.attended) {
          await handleToggleAttendance(attendee.id, false)
        }
        // Scroll to attendee
        const element = document.getElementById(`attendee-${attendee.id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-4', 'ring-primary-500')
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-primary-500')
          }, 3000)
        }
        setShowQRScanner(false)
      } else {
        alert('Attendee not found in this event')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to process QR code')
      console.error(err)
    }
  }

  const exportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Occupation',
      'Emergency Contact',
      'Age',
      'How Heard About',
      'Attended',
      'Attended At',
      'Registered At',
    ]

    const rows = attendees.map((a) => [
      a.name,
      a.email,
      a.phone || '',
      a.occupation || '',
      a.emergencyContact || '',
      a.ageRange || '',
      a.howHeardAbout || '',
      a.attended ? 'Yes' : 'No',
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
    a.download = `${event?.title.replace(/[^a-z0-9]/gi, '_') || 'event'}_attendees.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredAttendees = attendees.filter((attendee) => {
    const query = searchQuery.toLowerCase()
    return (
      attendee.name.toLowerCase().includes(query) ||
      attendee.email.toLowerCase().includes(query) ||
      (attendee.phone && attendee.phone.toLowerCase().includes(query))
    )
  })

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
        <Link
          href={`/admin/events/${eventId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Event
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event?.title}</h1>
            <p className="text-gray-600 mt-1">
              {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
              {attendees.length > 0 && (
                <span className="ml-2">
                  ({attendees.filter((a) => a.attended).length} signed in)
                </span>
              )}
              {event?.capacity && (
                <span className="ml-2">
                  • Capacity: {attendees.length} / {event.capacity}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {attendees.length > 0 && (
              <>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="inline-flex items-center gap-2 bg-secondary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  Scan QR Code
                </button>
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              </>
            )}
            <label className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              {importing ? 'Importing...' : 'Import Excel'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={importing}
                className="hidden"
              />
            </label>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Attendee
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search */}
        {attendees.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search attendees by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {attendees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No attendees registered yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Attendee
            </button>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No attendees match your search.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Attended
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Additional Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendees.map((attendee) => {
                    const isUpdating = updatingIds.has(attendee.id)
                    return (
                      <tr 
                        id={`attendee-${attendee.id}`}
                        key={attendee.id} 
                        className={`hover:bg-gray-50 transition-all ${attendee.attended ? 'bg-green-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleAttendance(attendee.id, attendee.attended)}
                              disabled={isUpdating}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                attendee.attended
                                  ? 'bg-green-600'
                                  : 'bg-gray-200'
                              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              title={attendee.attended ? 'Mark as not attended' : 'Mark as attended'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  attendee.attended ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          {attendee.attended && attendee.attendedAt && (
                            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-700">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(attendee.attendedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {attendee.attended && (
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                              {attendee.ageRange && (
                                <div className="text-sm text-gray-500">{attendee.ageRange}</div>
                              )}
                            </div>
                          </div>
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
                            {attendee.signature && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-xs font-medium text-gray-600">Signature:</span>
                                <img 
                                  src={attendee.signature} 
                                  alt="Signature" 
                                  className="mt-1 max-w-[100px] h-12 object-contain border border-gray-200 rounded"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(attendee.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {new Date(attendee.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(attendee)}
                              disabled={isUpdating}
                              className="text-primary-600 hover:text-primary-900 disabled:opacity-50"
                              title="Edit attendee"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(attendee.id)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete attendee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAttendee ? 'Edit Attendee' : 'Add Attendee'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </label>
                  <select
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select age range</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55-64">55-64</option>
                    <option value="65+">65+</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How Heard About
                  </label>
                  <select
                    value={formData.howHeardAbout}
                    onChange={(e) => setFormData({ ...formData, howHeardAbout: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Website">Website</option>
                    <option value="Friend/Family">Friend/Family</option>
                    <option value="Community Center">Community Center</option>
                    <option value="Healthcare Provider">Healthcare Provider</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Teacher, Engineer, Student"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                >
                  {editingAttendee ? 'Update' : 'Add'} Attendee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
          title="Scan Attendee QR Code"
        />
      )}
    </div>
  )
}
