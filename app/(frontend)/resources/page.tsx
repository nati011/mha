'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, FileText, User } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  author: string | null
  category: string | null
  publishedAt: string | null
  views: number
  clapCount?: number
}

export default function ResourcesPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'latest' | 'popular' | 'all'>('latest')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const postsResponse = await fetch('/api/blog?published=true')

      if (postsResponse.ok) {
        const posts = await postsResponse.json()
        setBlogPosts(posts)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredBlogPosts = () => {
    let filtered = [...blogPosts]
    
    switch (filter) {
      case 'latest':
        filtered = filtered.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return dateB - dateA
        })
        break
      case 'popular':
        filtered = filtered.sort((a, b) => b.views - a.views)
        break
      case 'all':
        // Keep original order
        break
    }
    
    return filtered
  }

  const getReadingTime = (content: string) => {
    const text = content.replace(/<[^>]+>/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const filteredPosts = getFilteredBlogPosts()

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Posts Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex flex-col gap-6 mb-8 items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">Blogs</h2>
          </div>
          
          {/* Filter Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setFilter('latest')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === 'latest'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === 'popular'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No blog posts available yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for new articles!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post: BlogPost, index: number) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', '-rotate-1']
                return (
                  <Link
                    key={post.id}
                    href={`/resources/${post.slug}`}
                    className={`bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden group transform ${rotations[index % rotations.length]} hover:rotate-0`}
                  >
                    {post.featuredImage && (
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      )}
                      {post.clapCount && post.clapCount > 0 && (
                        <div className="text-sm text-gray-500 mb-4">
                          👏 {post.clapCount}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          {post.author && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{post.author}</span>
                            </div>
                          )}
                          {post.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                          {post.clapCount && post.clapCount > 0 && (
                            <div className="flex items-center gap-1">
                              <span>👏</span>
                              <span>{post.clapCount}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>{getReadingTime(post.content)} min read</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600">
              Want to share your story? Register to create a blog post.
            </p>
            <Link
              href="/resources/new"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Register to Post
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
