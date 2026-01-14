'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface Announcement {
  id: number
  message: string
  link: string | null
  linkText: string | null
  backgroundColor: string | null
  textColor: string | null
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id: number) => {
    setDismissedIds((prev) => new Set([...prev, id]))
    // Store in sessionStorage to persist across page reloads
    if (typeof window !== 'undefined') {
      const dismissed = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]')
      dismissed.push(id)
      sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed))
    }
  }

  useEffect(() => {
    // Load dismissed announcements from sessionStorage
    if (typeof window !== 'undefined') {
      const dismissed = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]')
      setDismissedIds(new Set(dismissed))
    }
  }, [])

  if (loading) {
    return null
  }

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.has(announcement.id)
  )

  if (visibleAnnouncements.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {visibleAnnouncements.map((announcement) => {
        const bgColor = announcement.backgroundColor || '#fef3c7' // Default yellow
        const textColor = announcement.textColor || '#92400e' // Default dark yellow

        return (
          <div
            key={announcement.id}
            className="w-full py-2 px-4 text-center text-sm font-medium relative"
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            <div className="container-custom flex items-center justify-center gap-3">
              <span>{announcement.message}</span>
              {announcement.link && (
                <Link
                  href={announcement.link}
                  className="underline hover:no-underline font-semibold"
                  style={{ color: textColor }}
                >
                  {announcement.linkText || 'Learn more'}
                </Link>
              )}
              <button
                onClick={() => handleDismiss(announcement.id)}
                className="ml-auto absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                aria-label="Dismiss announcement"
                style={{ color: textColor }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

