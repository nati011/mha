// Gallery image data
// Add your gallery images to the /public/gallery/ directory
// Then add entries here with the image path and optional caption

export interface GalleryImage {
  id: string
  src: string // Path to image in /public (e.g., '/gallery/image-1.jpg')
  alt: string // Alt text for accessibility
  caption?: string // Optional caption
  category?: string // Optional category for filtering
}

export const galleryImages: GalleryImage[] = [
  {
    id: '1',
    src: '/gallery/mental_health_addis_pic_1.jpg',
    alt: 'Mental Health Addis event photo 1',
    caption: 'Community event photo',
    category: 'events'
  },
  {
    id: '2',
    src: '/gallery/mental_health_addis_pic_2.jpg.jpg',
    alt: 'Mental Health Addis event photo 2',
    caption: 'Community gathering',
    category: 'community'
  },
  {
    id: '3',
    src: '/gallery/mental_health_addis_pic_3.jpg.jpg.jpg',
    alt: 'Mental Health Addis event photo 3',
    caption: 'Workshop session',
    category: 'events'
  },
  {
    id: '4',
    src: '/gallery/mental_health_addis_pic_4jpg',
    alt: 'Mental Health Addis event photo 4',
    caption: 'Community event',
    category: 'community'
  },
]

