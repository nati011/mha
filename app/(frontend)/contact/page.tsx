'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Check URL params for inquiry type (from other pages)
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (type) {
      setFormData((prev) => ({ ...prev, inquiryType: type }))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd send this to your backend/email service
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general',
    })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Flowing Lines */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-primary-50/30 to-white overflow-hidden">
        {/* Flowing decorative lines */}
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
        
        {/* Flowing decorative lines - bottom */}
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
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              We're Here to Help
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Get in touch with us. We'd love to hear from you and answer any questions you may have.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information with Enhanced Cards */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        {/* Flowing divider - top */}
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

        {/* Flowing divider - bottom */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-300 transition-all duration-300 group transform rotate-1 hover:rotate-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <MapPin className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Address
              </h3>
              <p className="text-gray-600">
                Addis Ababa, Ethiopia
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-300 transition-all duration-300 group transform -rotate-1 hover:rotate-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <Mail className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email
              </h3>
              <a
                href="mailto:info@mentalhealthaddis.org"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors block"
              >
                info@mentalhealthaddis.org
              </a>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-300 transition-all duration-300 group transform rotate-1 hover:rotate-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <Phone className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Phone
              </h3>
              <a
                href="tel:+251984252627"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors block"
              >
                0984252627
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-700">
                  Your message has been sent. We'll get back to you as soon as
                  possible.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border-2 border-primary-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300"
              >
                <div className="mb-6">
                  <label
                    htmlFor="inquiryType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="volunteer">Volunteer Application</option>
                    <option value="story">Share Your Story</option>
                    <option value="partner">Partnership Inquiry</option>
                    <option value="events">Event Support</option>
                    <option value="resources">Resource Request</option>
                    <option value="media">Media Inquiry</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        {/* Flowing divider */}
        <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1200 80" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,15 Q100,30 200,20 Q300,10 400,25 Q500,40 600,25 Q700,10 800,30 Q900,50 1000,35 Q1100,20 1200,30 L1200,0 L0,0 Z"
              fill="#e6f9e6"
            />
          </svg>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Other Ways to Connect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform rotate-1 hover:rotate-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Social Media
                </h3>
                <p className="text-gray-600 mb-4">
                  Follow us on social media for updates, resources, and community
                  discussions.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="#"
                    className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    Twitter
                  </a>
                  <a
                    href="#"
                    className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform -rotate-1 hover:rotate-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Office Hours
                </h3>
                <p className="text-gray-600 mb-2">
                  <strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Saturday:</strong> 10:00 AM - 2:00 PM
                </p>
                <p className="text-gray-600">
                  <strong>Sunday:</strong> Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

