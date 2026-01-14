'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { partners as defaultPartners, type Partner } from '@/data/partners'

interface PartnersSectionProps {
  partners?: Partner[]
}

export default function PartnersSection({ partners = defaultPartners }: PartnersSectionProps) {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/c4a6ed62-2cb3-4f89-91a5-a32f5e88e56b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnersSection.tsx:12',message:'PartnersSection component mounted',data:{partnersCount:partners?.length,defaultPartnersCount:defaultPartners?.length,hasPartners:partners && partners.length > 0,cssLoaded:typeof window !== 'undefined' && !!document.querySelector('style[data-next-hide-fouc]')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  }, []);
  // #endregion
  const hasPartners = partners && partners.length > 0

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            We Work With
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Proud to collaborate with organizations that share our mission of mental health awareness and support.
          </p>
        </div>

        {hasPartners ? (
          <div className="flex flex-wrap justify-center items-center gap-8 max-w-2xl mx-auto">
            {partners.map((partner) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/c4a6ed62-2cb3-4f89-91a5-a32f5e88e56b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnersSection.tsx:33',message:'Rendering partner',data:{partnerName:partner.name,logoPath:partner.logo,hasUrl:!!partner.url,imageSrc:partner.logo},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            const logoElement = (
              <div 
                className="relative w-full max-w-[180px] h-24 flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 transform hover:scale-105 group"
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="max-h-16 max-w-[140px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  onError={(e) => {
                    // #region agent log
                    const target = e.target as HTMLImageElement;
                    fetch('http://127.0.0.1:7242/ingest/c4a6ed62-2cb3-4f89-91a5-a32f5e88e56b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnersSection.tsx:42',message:'Image load error',data:{partnerName:partner.name,logoPath:partner.logo,imageSrc:target?.src,error:'Image failed to load',naturalWidth:target?.naturalWidth,naturalHeight:target?.naturalHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
                    // #endregion
                  }}
                  onLoad={(e) => {
                    // #region agent log
                    const target = e.target as HTMLImageElement;
                    fetch('http://127.0.0.1:7242/ingest/c4a6ed62-2cb3-4f89-91a5-a32f5e88e56b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnersSection.tsx:47',message:'Image loaded successfully',data:{partnerName:partner.name,logoPath:partner.logo,imageSrc:target?.src,naturalWidth:target?.naturalWidth,naturalHeight:target?.naturalHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
                    // #endregion
                  }}
                />
              </div>
            )

            if (partner.url) {
              return (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center"
                  aria-label={`Visit ${partner.name} website`}
                >
                  {logoElement}
                </Link>
              )
            }

            return (
              <div key={partner.name} className="flex justify-center">
                {logoElement}
              </div>
            )
          })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Partner logos will appear here once added.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Add partner information in <code className="bg-gray-100 px-2 py-1 rounded">/data/partners.ts</code>
            </p>
          </div>
        )}
      </div>
    </section>
  )
  // #region agent log
  // Note: This log won't execute due to return above, but component should render
  // #endregion
}

