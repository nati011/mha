import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import BlogReactions from '@/components/BlogReactions'

function getBaseUrl() {
  const headerList = headers()
  const hostHeader = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const host = hostHeader?.split(',')[0]?.trim()
  const protocol = headerList.get('x-forwarded-proto') ?? 'http'

  if (host) {
    return `${protocol}://${host}`
  }

  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, '')
  }

  return 'http://localhost:3000'
}

function getReadingTime(content: string) {
  const text = content.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

async function getBlogPost(slug: string) {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
  }
  return null
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)
  const readingTime = post ? getReadingTime(post.content || '') : 1

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>

          <div className="bg-primary-50 rounded-2xl px-6 py-8 mb-10">
            <header className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 font-semibold shadow-sm">
                    {(post.author || 'M').slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      {post.author || 'Mental Health Addis'}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500">
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}</span>
                        </div>
                      )}
                      <span>·</span>
                      <span>{readingTime} min read</span>
                    </div>
                  </div>
                </div>
              </div>
              {post.contactPreference && (
                <div className="mt-4 rounded-xl border border-primary-100 bg-white/70 px-4 py-3 text-sm text-gray-700">
                  <p className="font-semibold text-primary-700">How to contact me</p>
                  <p className="text-gray-600 break-words">{post.contactPreference}</p>
                </div>
              )}
            </header>
          </div>

          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-2xl mb-10"
            />
          )}

          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-800 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <BlogReactions slug={params.slug} />
        </div>
      </article>
    </div>
  )
}

