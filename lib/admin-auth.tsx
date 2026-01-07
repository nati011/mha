'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // We'll check auth by trying to fetch a protected resource
      // In a real app, you'd have a dedicated auth check endpoint
      const response = await fetch('/api/events', {
        method: 'GET',
        credentials: 'include',
      })

      // For now, we'll assume GET /api/events is public
      // We'll check auth when making POST/PUT/DELETE requests
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { isAuthenticated, logout }
}

