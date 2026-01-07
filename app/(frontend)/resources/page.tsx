'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Download,
  FileText,
  Heart,
  Users,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Calendar,
  User,
} from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  author: string | null
  category: string | null
  publishedAt: string | null
  views: number
}

interface Resource {
  id: number
  title: string
  description: string | null
  category: string | null
  fileType: string | null
  fileUrl: string | null
}

export default function ResourcesPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'latest' | 'popular' | 'all'>('latest')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [postsResponse, resourcesResponse] = await Promise.all([
        fetch('/api/blog?published=true'),
        fetch('/api/resources?accessLevel=public'),
      ])

      if (postsResponse.ok) {
        const posts = await postsResponse.json()
        setBlogPosts(posts)
      }

      if (resourcesResponse.ok) {
        const res = await resourcesResponse.json()
        setResources(res)
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Latest Blog Posts</h2>
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
                        </div>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        {/* Flowing divider */}
        <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1200 100" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 Q150,10 300,50 Q450,80 600,30 Q750,5 900,55 Q1050,85 1200,40 L1200,0 L0,0 Z"
              fill="white"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Resources
          </h2>
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No resources available yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for new resources!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource: any, index: number) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', '-rotate-1']
                const getFileIcon = () => {
                  if (resource.fileType === 'pdf') return Download
                  if (resource.fileType === 'doc' || resource.fileType === 'docx') return FileText
                  return BookOpen
                }
                const FileIcon = getFileIcon()
                
                return (
                  <div
                    key={resource.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform ${rotations[index % rotations.length]} hover:rotate-0`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                        <FileIcon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        {resource.category && (
                          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                            {resource.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {resource.fileUrl && (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download {resource.fileType?.toUpperCase() || 'File'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {!resource.fileUrl && (
                      <div className="text-sm text-gray-500">
                        Resource coming soon
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-primary-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need More Support?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              If you're looking for additional resources or have questions, don't hesitate to
              reach out to us.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
