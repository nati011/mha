'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCog,
  LogOut, 
  Home,
  Menu,
  X,
  ClipboardCheck,
  MessageSquare,
  UserCheck,
  FileText,
  BookOpen,
  Video,
  MapPin
} from 'lucide-react'
import Logo from '@/components/Logo'

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [username, setUsername] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const checkingAuthRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    
    // Skip auth check if already on login page
    if (pathname === '/admin/login') {
      setIsAuthenticated(false)
      checkingAuthRef.current = false
      return () => {
        isMounted = false
      }
    }
    
    // Prevent multiple simultaneous auth checks
    if (checkingAuthRef.current) {
      return () => {
        isMounted = false
      }
    }
    
    // Always check auth when navigating to admin pages
    checkingAuthRef.current = true
    
    fetch('/api/auth/check', {
      credentials: 'include',
    })
      .then((response) => {
        if (!isMounted) return null
        
        // Don't redirect if we're already on login page
        if (!response.ok) {
          setIsAuthenticated(false)
          checkingAuthRef.current = false
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
          return null
        }
        return response.json()
      })
      .then((data) => {
        if (!isMounted) return
        if (data?.authenticated) {
          setIsAuthenticated(true)
          setUsername(data.username || 'Admin')
        } else {
          setIsAuthenticated(false)
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
        }
        checkingAuthRef.current = false
      })
      .catch((error) => {
        if (!isMounted) return
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        checkingAuthRef.current = false
        // Don't redirect if we're already on login page
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      })
    
    return () => {
      isMounted = false
      checkingAuthRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleLogout = async () => {
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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/chapters', label: 'Chapters', icon: MapPin },
    { href: '/admin/recordings', label: 'Recordings', icon: Video },
    { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/admin/campaigns', label: 'Campaigns', icon: MessageSquare },
    { href: '/admin/blog', label: 'Blog', icon: FileText },
    { href: '/admin/resources', label: 'Resources', icon: BookOpen },
    { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
    { href: '/admin/members', label: 'Members', icon: UserCheck },
    { href: '/admin/attendees', label: 'Attendees', icon: Users },
    { href: '/admin/users', label: 'Users', icon: UserCog },
  ]

  // Don't show layout on login page - always show login page if pathname matches
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // If not authenticated and not on login page, redirect (or show loading while redirecting)
  if (isAuthenticated === false) {
    // Redirect will happen via useEffect, but show loading in the meantime
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden border-0 p-0 cursor-pointer"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSidebarOpen(false)
            }
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Logo href={null} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer section */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">View Site</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              {/* User Profile Section */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}

