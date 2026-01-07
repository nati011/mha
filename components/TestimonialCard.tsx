import { Quote } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  avatar: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({
  testimonial,
}: TestimonialCardProps) {
  return (
    <div className="card">
      <Quote className="w-8 h-8 text-primary mb-4" />
      <p className="text-gray-700 mb-6 italic leading-relaxed">
        "{testimonial.content}"
      </p>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}

