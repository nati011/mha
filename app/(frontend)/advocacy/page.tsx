'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HandHeart,
  Users,
  Building2,
  Share2,
  ArrowRight,
  CheckCircle,
  Mail,
  Calendar,
  Sparkles,
  Send,
} from 'lucide-react'

export default function AdvocacyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    availability: '',
    activityType: '',
    areasOfInterest: [] as string[],
    willingToTravel: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that at least one area of interest is selected
    if (formData.areasOfInterest.length === 0) {
      alert('Please select at least one area of interest.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/volunteer-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Success - show success message
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        availability: '',
        activityType: '',
        areasOfInterest: [],
        willingToTravel: '',
        message: '',
      })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting volunteer application:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    if (checked) {
      setFormData({
        ...formData,
        areasOfInterest: [...formData.areasOfInterest, value],
      })
    } else {
      setFormData({
        ...formData,
        areasOfInterest: formData.areasOfInterest.filter((item) => item !== value),
      })
    }
  }
  const waysToGetInvolved = [
    {
      icon: HandHeart,
      title: 'Become a Member',
      description:
        'Join Mental Health Addis as a member and be part of a community dedicated to mental health awareness and support.',
      features: [
        'Active participation in events',
        'Community engagement opportunities',
        'Access to member resources',
        'Peer support networks',
      ],
      cta: 'Apply for Membership',
      link: '/membership',
    },
    {
      icon: Share2,
      title: 'Share Your Story',
      description:
        'Your story matters. Share your mental health journey to help others feel less alone and reduce stigma.',
      features: [
        'Anonymous or named options',
        'Support throughout the process',
        'Multiple sharing formats',
        'Community impact',
      ],
      cta: 'Share Your Story',
      link: '/contact?type=story',
    },
    {
      icon: Building2,
      title: 'Partner With Us',
      description:
        'Organizations, businesses, and institutions can partner with us to expand our reach and impact.',
      features: [
        'Corporate partnerships',
        'Educational collaborations',
        'Community organization alliances',
        'Sponsorship opportunities',
      ],
      cta: 'Partner With Us',
      link: '/contact?type=partner',
    },
    {
      icon: Calendar,
      title: 'Support Events',
      description:
        'Help us organize and run events, or host your own event in partnership with Mental Health Addis.',
      features: [
        'Event hosting support',
        'Venue partnerships',
        'Speaker opportunities',
        'Event sponsorship',
      ],
      cta: 'Support Events',
      link: '/contact?type=events',
    },
  ]

  const volunteerRoles = [
    {
      title: 'Event Coordinator',
      description:
        'Help plan and execute our monthly events and community gatherings.',
      timeCommitment: '5-10 hours/month',
    },
    {
      title: 'Community Outreach',
      description:
        'Spread awareness in your community and help us reach new audiences.',
      timeCommitment: '3-5 hours/month',
    },
    {
      title: 'Resource Developer',
      description:
        'Create educational materials, articles, and resources for our library.',
      timeCommitment: '5-8 hours/month',
    },
    {
      title: 'Peer Support Facilitator',
      description:
        'Lead or co-facilitate peer support groups and meetups.',
      timeCommitment: '4-6 hours/month',
    },
    {
      title: 'Social Media & Communications',
      description:
        'Help manage our social media presence and communications.',
      timeCommitment: '3-5 hours/week',
    },
    {
      title: 'Translation & Localization',
      description:
        'Translate resources and materials into local languages.',
      timeCommitment: 'Variable',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Get Involved
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto">
            Join our community of advocates, volunteers, and supporters
            working to transform mental health awareness
          </p>
        </div>
      </section>

      {/* Why Get Involved Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Flowing divider */}
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
              fill="#f0f5d0"
            />
          </svg>
        </div>
        
      </section>

      {/* Volunteer Application Form */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Volunteer Application
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below to apply as a volunteer. We'd love to have you join our team!
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-700">
                  Your volunteer application has been submitted. We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-primary-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300"
              >
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
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="availability"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Availability *
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select availability</option>
                    <option value="days-per-week">Days per week</option>
                    <option value="days-per-month">Days per month</option>
                    <option value="months-per-year">Months per year</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="activityType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Types of Activity You Want to Enroll In *
                  </label>
                  <select
                    id="activityType"
                    name="activityType"
                    value={formData.activityType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select activity type</option>
                    <option value="regular">Regular volunteering</option>
                    <option value="event-based">Event-based volunteering</option>
                    <option value="project-based">Project-based volunteering</option>
                    <option value="flexible">Flexible schedule</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Area(s) of Interest * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Event Setup',
                      'Registration Desk',
                      'Hospitality/Guest Services',
                      'Workshop Facilitation (trainings, arts: music, painting, literature, drama)',
                      'Digital Marketing/Promotion',
                      'Fundraising',
                      'Graphic Design',
                      'Photography',
                      'Content Development',
                    ].map((area) => (
                      <label
                        key={area}
                        className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          value={area}
                          checked={formData.areasOfInterest.includes(area)}
                          onChange={handleCheckboxChange}
                          className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700 text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Are you willing to travel outside of Addis occasionally? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="willingToTravel"
                        value="yes"
                        checked={formData.willingToTravel === 'yes'}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="willingToTravel"
                        value="no"
                        checked={formData.willingToTravel === 'no'}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition-all duration-200 shadow-md hover:shadow-lg transform rotate-2 hover:rotate-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Volunteer Roles Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-secondary-50 overflow-hidden">
        <div className="container-custom relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Volunteer Opportunities
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 mb-12 text-center">
              We have various volunteer roles available. Find one that matches
              your interests, skills, and availability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Event Setup',
                'Registration Desk',
                'Hospitality/Guest Services',
                'Workshop Facilitation (trainings, arts: music, painting, literature, drama)',
                'Digital Marketing/Promotion',
                'Fundraising',
                'Graphic Design',
                'Photography',
                'Content Development',
              ].map((area, index) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', '-rotate-1']
                return (
                  <div
                    key={area}
                    className={`bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 hover:shadow-lg hover:border-secondary-200 transition-all duration-300 transform ${rotations[index % rotations.length]} hover:rotate-0 flex items-center justify-center min-h-[120px]`}
                  >
                    <p className="text-gray-900 font-medium text-center">
                      {area}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
