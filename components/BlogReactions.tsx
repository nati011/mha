'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Share2 } from 'lucide-react'

type BlogReactionsProps = {
  slug: string
}

export default function BlogReactions({ slug }: BlogReactionsProps) {
  const [claps, setClaps] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [showClapAnimation, setShowClapAnimation] = useState(false)
  const shareRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadReactions = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}/reactions`)
        if (!response.ok) {
          throw new Error('Failed to load reactions')
        }
        const data = await response.json()
        setClaps(data.clapCount ?? 0)
      } catch (err: any) {
        console.error('Failed to load reactions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadReactions()
  }, [slug])

  const updateReaction = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clap' }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update reactions')
      }
      const data = await response.json()
      setClaps(data.clapCount ?? 0)
    } catch (err: any) {
      console.error('Failed to update reactions:', err)
    }
  }

  const addClap = () => {
    updateReaction()
    setShowClapAnimation(true)
    window.setTimeout(() => setShowClapAnimation(false), 3000)
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareOpen(false)
      }
    }
    if (shareOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [shareOpen])

  const getShareUrl = () => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.href
  }

  const handleInstagramShare = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Instagram share failed:', err)
    }
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-6">
      <AnimatePresence>
        {showClapAnimation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/90 border border-primary-200 shadow-2xl rounded-full w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
              style={{ perspective: '900px' }}
              initial={{ scale: 0.3, rotateX: -35, rotateZ: -10 }}
              animate={{ scale: 1.15, rotateX: 0, rotateZ: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <img
                src="https://emojiterra.com/data/animated-emoji/1f44f.gif"
                alt="Clapping hands"
                className="w-28 h-28 sm:w-32 sm:h-32"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addClap}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-primary-200 hover:text-primary-600 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            <span className="text-base leading-none">👏</span>
            <span>Clap</span>
            <span className="text-xs text-gray-500">{claps}</span>
          </button>
        </div>
        <div className="relative flex items-center gap-3" ref={shareRef}>
          <button
            type="button"
            onClick={() => setShareOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-primary-200 hover:text-primary-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
          {shareOpen && (
            <div className="absolute mt-12 right-0 z-10 w-52 rounded-xl border border-gray-200 bg-white shadow-lg p-2 text-sm text-gray-700">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
              >
                Telegram
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
              >
                LinkedIn
              </a>
              <button
                type="button"
                onClick={handleInstagramShare}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
              >
                Instagram
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

