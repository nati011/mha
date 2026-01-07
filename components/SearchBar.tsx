'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Calendar, FileText, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResults {
  events: any[]
  blogPosts: any[]
  members: any[]
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = results
    ? results.events.length + results.blogPosts.length + results.members.length
    : 0

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search events, blog posts, members..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults(null)
              setShowResults(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-600" />
            </div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <div className="p-2">
              {results!.events.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Events ({results!.events.length})
                  </div>
                  {results!.events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      onClick={() => setShowResults(false)}
                      className="block px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.venue}</div>
                    </Link>
                  ))}
                </div>
              )}

              {results!.blogPosts.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4" />
                    Blog Posts ({results!.blogPosts.length})
                  </div>
                  {results!.blogPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/resources/${post.slug}`}
                      onClick={() => setShowResults(false)}
                      className="block px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <div className="font-medium text-gray-900">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {results!.members.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4" />
                    Members ({results!.members.length})
                  </div>
                  {results!.members.map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile?email=${encodeURIComponent(member.email)}`}
                      onClick={() => setShowResults(false)}
                      className="block px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <div className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      {member.occupation && (
                        <div className="text-sm text-gray-500">{member.occupation}</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

