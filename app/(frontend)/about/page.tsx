import Link from 'next/link'

export default function AboutPage() {
  const milestones = [
    {
      year: '2023',
      title: 'First Events',
      description: 'Launched our monthly talk series and community dialogues.',
    },
    {
      year: '2025',
      title: '20+ events hosted',
      description: 'Cultivated a network of mental-health professionals and advocates.',
    },
    {
      year: '2026',
      title: 'Expanding Impact',
      description: 'Digitizing & Continuing to grow our reach to deepen our impact.',
    },
  ]
  const volunteerHighlights = [
    {
      title: 'Community Outreach',
      description: 'Help us connect with communities and expand mental health awareness.',
    },
    {
      title: 'Event Support',
      description: 'Assist with organizing and hosting talks, workshops, and community gatherings.',
    },
    {
      title: 'Content & Storytelling',
      description: 'Share stories, create resources, and amplify mental health conversations.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Our Journey Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="container-custom relative z-10">
          <h2 className="text-4xl font-bold text-center text-gray-900">
            Our Journey
          </h2>
          <div className="relative bg-primary-50 overflow-hidden rounded-2xl px-6 py-12 mt-8">
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Year Badge */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform hover:scale-110 transition-transform">
                          {milestone.year}
                        </div>
                        {index < milestones.length - 1 && (
                          <div className="w-1 h-12 bg-primary-300 mt-2 rounded-full"></div>
                        )}
                      </div>
                      
                      {/* Content Card */}
                      <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-md hover:border-primary-200 transition-all">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Our Approach
            </h2>
            <div className="space-y-6 text-gray-700">
              <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Community-Led
                </h3>
                <p className="text-lg leading-relaxed">
                  We believe that the best solutions come from within the
                  community. Our programs and initiatives are developed in
                  partnership with community members, ensuring they are
                  culturally relevant and truly meet local needs.
                </p>
              </div>
              <div className="bg-secondary-50 rounded-xl p-6 border-2 border-secondary-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Holistic Support
                </h3>
                <p className="text-lg leading-relaxed">
                  We recognize that mental health is interconnected with many
                  aspects of life. Our approach considers social, economic, and
                  cultural factors that impact well-being.
                </p>
              </div>
              <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Accessibility First
                </h3>
                <p className="text-lg leading-relaxed">
                  We strive to make our resources and events accessible to
                  everyone, regardless of background, language, or economic
                  status. Many of our events are free, and we provide materials
                  in multiple formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteers Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Volunteers
            </h2>
            <p className="text-lg text-gray-600">
              Our volunteers power our programs, events, and outreach. Join the team
              and help us make mental health support more accessible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {volunteerHighlights.map((item, index) => (
              <div
                key={item.title}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-md hover:border-primary-200 transition-all transform ${
                  index % 2 === 0 ? '-rotate-1' : 'rotate-1'
                } hover:rotate-0`}
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/advocacy"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
