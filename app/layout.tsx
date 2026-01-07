import type { Metadata } from 'next'
import { Overpass } from 'next/font/google'
import './globals.css'

const overpass = Overpass({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-overpass',
})

export const metadata: Metadata = {
  title: 'Mental Health Addis - Empowering Minds, Building Community',
  description: 'We raise awareness, dismantle stigma, and create safe spaces for meaningful discussions about mental health in Addis Ababa and beyond.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={overpass.variable}>
      <body className={overpass.className}>
        {children}
      </body>
    </html>
  )
}

