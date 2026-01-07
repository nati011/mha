'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, HelpCircle, MessageCircle, Calendar, Clock } from 'lucide-react'

interface Feedback {
  id: number
  type: string
  feedback: string
  createdAt: string
  name: string | null
  email: string | null
  anonymous: boolean
}

interface Event {
  id: number
  title: string
  date: string
  time: string
}

export default function EventFeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'question' | 'comment'>('all')

  useEffect(() => {
    fetchData()
  }, [eventId, filter])

  const fetchData = async () => {
    try {
      const authCheck = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      
      if (!authCheck.ok) {
        router.push('/admin/login')
        return
      }

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`, {
        credentials: 'include',
      })
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        setEvent(eventData)
      }

      // Fetch feedback
      const feedbackUrl = filter === 'all' 
        ? `/api/events/${eventId}/feedback`
        : `/api/events/${eventId}/feedback?type=${filter}`
      
      const feedbackResponse = await fetch(feedbackUrl, {
        credentials: 'include',
      })
      
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json()
        setFeedback(feedbackData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const questions = feedback.filter((f) => f.type === 'question')
  const comments = feedback.filter((f) => f.type === 'comment')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Feedback</h1>
          {event && (
            <div className="mt-2 flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
            </div>
          )}
          {event && <p className="text-lg text-gray-700 mt-1">{event.title}</p>}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({feedback.length})
        </button>
        <button
          onClick={() => setFilter('question')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'question'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Questions ({questions.length})
        </button>
        <button
          onClick={() => setFilter('comment')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'comment'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Comments ({comments.length})
        </button>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No {filter === 'all' ? 'feedback' : filter === 'question' ? 'questions' : 'comments'} yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {item.type === 'question' ? (
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    item.type === 'question'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'question' ? 'Question' : 'Comment'}
                  </span>
                  {!item.anonymous && item.name && (
                    <span className="text-sm text-gray-600">from {item.name}</span>
                  )}
                  {item.anonymous && (
                    <span className="text-sm text-gray-500 italic">Anonymous</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{item.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

