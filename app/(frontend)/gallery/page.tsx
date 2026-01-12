'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { galleryImages, type GalleryImage } from '@/data/gallery'

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get unique categories
  const categories = ['all', ...new Set(galleryImages.map(img => img.category).filter((cat): cat is string => Boolean(cat)))]

  // Filter images by category
  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory)

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        {/* Flowing divider - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <svg 
            className="absolute bottom-0 left-0 w-full h-full" 
            viewBox="0 0 1200 100" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,40 Q150,80 300,50 Q450,10 600,60 Q750,90 900,35 Q1050,5 1200,55 L1200,100 L0,100 Z"
              fill="white"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Gallery
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto">
            Moments from our events, community gatherings, and activities
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding">
        <div className="container-custom">
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Grid */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">
                No images in the gallery yet.
              </p>
              <p className="text-gray-400 text-sm">
                Add images to <code className="bg-gray-100 px-2 py-1 rounded">/data/gallery.ts</code>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5']
                const rotation = rotations[index % rotations.length]
                
                return (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer transform ${rotation} hover:rotate-0 transition-all duration-300`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        {image.caption && (
                          <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 text-center">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-full object-contain rounded-lg"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4 text-lg">
                {selectedImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

