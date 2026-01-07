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
} from 'lucide-react'

export default function AdvocacyPage() {
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
      {/* Hero Section with Flowing Lines */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Flowing decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden opacity-20">
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1200 160" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,80 Q300,30 600,60 T1200,50 L1200,0 L0,0 Z"
              fill="url(#gradient1)"
            />
            <path
              d="M0,100 Q400,40 800,70 T1200,60 L1200,0 L0,0 Z"
              fill="url(#gradient2)"
            />
            <path
              d="M0,90 Q250,35 500,55 T1000,45 L1200,40 L1200,0 L0,0 Z"
              fill="url(#gradient3)"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#BCD13B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#BCD13B" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#BCD13B" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#BCD13B" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get Involved
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Join our community of advocates, volunteers, and supporters
              working to transform mental health awareness
            </p>
          </div>
        </div>
      </section>

      {/* Ways to Get Involved */}
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
              fill="#e6f9e6"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Ways to Get Involved
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {waysToGetInvolved.map((way, index) => {
              const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2']
              return (
                <div
                  key={way.title}
                  className={`bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 shadow-sm border-2 border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform ${rotations[index]} hover:rotate-0`}
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                    <way.icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {way.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{way.description}</p>
                  <ul className="space-y-2 mb-6">
                    {way.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start space-x-2 text-gray-700"
                      >
                        <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={way.link}
                    className="inline-flex items-center text-primary-500 font-semibold hover:text-primary-600 transition-colors group"
                  >
                    {way.cta}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Volunteer Roles Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
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
              d="M0,40 Q150,80 300,50 Q450,10 600,60 Q750,90 900,35 Q1050,5 1200,55 L1200,0 L0,0 Z"
              fill="white"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Volunteer Opportunities
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              We have various volunteer roles available. Find one that matches
              your interests, skills, and availability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {volunteerRoles.map((role, index) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', '-rotate-1']
                return (
                  <div
                    key={role.title}
                    className={`bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform ${rotations[index % rotations.length]} hover:rotate-0`}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{role.description}</p>
                    <p className="text-sm text-primary-500 font-medium">
                      Time Commitment: {role.timeCommitment}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/contact?type=volunteer"
                className="inline-block bg-primary-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition-all duration-200 shadow-md hover:shadow-lg transform rotate-2 hover:rotate-0"
              >
                Apply to Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Get Involved Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Why Get Involved?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-primary-50 rounded-xl p-6 border-2 border-primary-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <Users className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Build Community
                </h3>
                <p className="text-gray-600">
                  Connect with like-minded individuals who care about mental
                  health advocacy.
                </p>
              </div>
              <div className="text-center bg-secondary-50 rounded-xl p-6 border-2 border-secondary-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <CheckCircle className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Make an Impact
                </h3>
                <p className="text-gray-600">
                  Contribute to meaningful change in how mental health is
                  perceived and addressed.
                </p>
              </div>
              <div className="text-center bg-primary-50 rounded-xl p-6 border-2 border-primary-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <HandHeart className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Personal Growth
                </h3>
                <p className="text-gray-600">
                  Develop new skills, gain experience, and grow personally while
                  helping others.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
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
              fill="white"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Partnership Benefits
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-md border-2 border-primary-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <p className="text-lg text-gray-700 mb-6">
                Organizations that partner with Mental Health Addis benefit
                from:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Increased community visibility',
                  'Alignment with social responsibility goals',
                  'Access to mental health resources for employees/members',
                  'Opportunities for collaborative events',
                  'Positive brand association',
                  'Networking with other community organizations',
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start space-x-2 text-gray-700"
                  >
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Flowing divider */}
        <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden opacity-20">
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1200 80" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,50 Q300,20 600,40 T1200,30 L1200,0 L0,0 Z"
              fill="url(#ctaGradient)"
            />
            <defs>
              <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#BCD13B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Whether you want to volunteer, share your story, partner with us,
              or support our events, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-white text-primary-500 px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg transform rotate-2 hover:rotate-0"
              >
                Get in Touch
              </Link>
              <Link
                href="/events"
                className="inline-block bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-200 transform -rotate-2 hover:rotate-0"
              >
                View Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
