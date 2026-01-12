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
    name: 'Embassy of Ireland',
    logo: '/embassy_of_ireland_logo.png',
    url: 'https://www.ireland.ie/en/ethiopia/addisababa/'
  },
  {
    name: 'WaterAid',
    logo: '/water_aid_logo.png',
    url: 'https://www.wateraid.org/et/'
  },
]

