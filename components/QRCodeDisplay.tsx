'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Copy } from 'lucide-react'
import { useState } from 'react'

interface QRCodeDisplayProps {
  value: string
  title?: string
  size?: number
  showActions?: boolean
}

export default function QRCodeDisplay({ 
  value, 
  title = 'QR Code',
  size = 256,
  showActions = true 
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border-2 border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}
      <div id={`qr-code-${value.slice(0, 10)}`} className="p-4 bg-white rounded-lg">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      {showActions && (
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  )
}


