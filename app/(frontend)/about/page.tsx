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
      description: 'Continuing to grow our reach and deepen our impact.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Our Journey Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 overflow-hidden">
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
              fill="#e6f9e6"
            />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Journey
          </h2>
          <div className="max-w-3xl mx-auto">
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
      </section>

      {/* Our Approach Section */}
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
              d="M0,40 Q150,80 300,50 Q450,10 600,60 Q750,90 900,35 Q1050,5 1200,55 L1200,0 L0,0 Z"
              fill="#e6f9e6"
            />
          </svg>
        </div>
        
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
    </div>
  )
}
