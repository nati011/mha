'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Printer } from 'lucide-react'
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

  const handleDownload = () => {
    const svg = document.querySelector(`#qr-code-${value.slice(0, 10)}`)?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `${title.replace(/\s+/g, '-')}-QR.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePrint = () => {
    const qrElement = document.querySelector(`#qr-code-${value.slice(0, 10)}`)
    if (!qrElement) return

    const svg = qrElement.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)))
    const svgDataUri = `data:image/svg+xml;base64,${svgBase64}`

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const escapedTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const escapedValue = value.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapedTitle} - QR Code</title>
          <style>
            @media print {
              @page {
                margin: 20mm;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #000;
            }
            .qr-code {
              display: inline-block;
              padding: 20px;
              background: white;
              border: 2px solid #000;
            }
            .qr-url {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              word-break: break-all;
              max-width: 500px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-title">${escapedTitle}</div>
            <div class="qr-code">
              <img src="${svgDataUri}" alt="QR Code" style="width: ${size}px; height: ${size}px;" />
            </div>
            <div class="qr-url">${escapedValue}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }, 250);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
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
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
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


