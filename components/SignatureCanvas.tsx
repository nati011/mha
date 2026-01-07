'use client'

import { useRef, useState } from 'react'
import SignatureCanvasLib from 'react-signature-canvas'
import { X, RotateCcw } from 'lucide-react'

interface SignatureCanvasProps {
  onSave: (signature: string) => void
  onCancel: () => void
  name?: string
}

export default function SignatureCapture({ onSave, onCancel, name }: SignatureCanvasProps) {
  const sigPadRef = useRef<SignatureCanvasLib>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    sigPadRef.current?.clear()
    setIsEmpty(true)
  }

  const handleSave = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataURL = sigPadRef.current.toDataURL('image/png')
      onSave(dataURL)
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {name ? `Sign for ${name}` : 'Digital Signature'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
          <SignatureCanvasLib
            ref={sigPadRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas w-full h-full',
            }}
            onBegin={handleBegin}
            backgroundColor="#ffffff"
            penColor="#000000"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <div className="flex-1" />
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  )
}

