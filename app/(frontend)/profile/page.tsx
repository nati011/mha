'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, User, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [member, setMember] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: '',
    profilePicture: '',
    bio: '',
  })

  useEffect(() => {
    // Get email from query params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email') || localStorage.getItem('memberEmail')

    if (!email) {
      router.push('/membership')
      return
    }

    fetchProfile(email)
  }, [])

  const fetchProfile = async (email: string) => {
    try {
      const response = await fetch(`/api/members/profile?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/membership')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setMember(data)
      setFormData({
        email: data.email,
        profilePicture: data.profilePicture || '',
        bio: data.bio || '',
      })

      // Store email for future use
      localStorage.setItem('memberEmail', data.email)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const updated = await response.json()
      setMember(updated)
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Member not found</div>
      </div>
    )
  }

  if (member.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="section-padding">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Profile Access Restricted
                </h1>
                <p className="text-gray-600 mb-6">
                  Your membership application is still pending review. Once your application
                  is approved, you'll be able to manage your profile.
                </p>
                <Link
                  href="/"
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">My Profile</h1>
            <p className="text-xl text-gray-200">
              Manage your member profile and information
            </p>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Profile Picture Preview */}
              <div className="mb-6 text-center">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{member.email}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Member
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={formData.profilePicture}
                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a URL to your profile picture. You can upload images to services like
                    Imgur, Cloudinary, or your own hosting.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Description
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself, your interests, and what you bring to the community..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Share a bit about yourself with the community
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Profile
                      </>
                    )}
                  </button>
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

