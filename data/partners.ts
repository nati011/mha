// Partner/Company data for the "We Have Worked With" section
// Add your partner logos to the /public/partners/ directory
// Then add entries here with the logo path and optional website URL

export interface Partner {
  name: string
  logo: string // Path to logo image in /public (e.g., '/partners/company-logo.png')
  url?: string // Optional website URL
}

export const partners: Partner[] = [
  {
    name: 'Company 1',
    logo: '/partners/placeholder-1.svg',
    url: 'https://example.com'
  },
  {
    name: 'Company 2',
    logo: '/partners/placeholder-2.svg',
    url: 'https://example.com'
  },
  {
    name: 'Company 3',
    logo: '/partners/placeholder-3.svg',
    url: 'https://example.com'
  },
  {
    name: 'Company 4',
    logo: '/partners/placeholder-4.svg',
    url: 'https://example.com'
  },
  {
    name: 'Company 5',
    logo: '/partners/placeholder-5.svg',
    url: 'https://example.com'
  },
]

