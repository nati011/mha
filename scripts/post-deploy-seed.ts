#!/usr/bin/env node
/**
 * Post-deployment seeding script
 * This runs after Vercel deployment to seed the admin user
 * 
 * Usage:
 * - Set SEED_SECRET_TOKEN in Vercel environment variables (optional but recommended)
 * - Call: POST https://your-app.vercel.app/api/admin/seed
 * - Or set up a Vercel webhook to call this after deployment
 */

import 'dotenv/config'

async function seedAfterDeployment() {
  const deploymentUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const seedToken = process.env.SEED_SECRET_TOKEN
  
  console.log('🌱 Attempting to seed admin user after deployment...')
  console.log('Deployment URL:', deploymentUrl)
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (seedToken) {
      headers['Authorization'] = `Bearer ${seedToken}`
    }
    
    const response = await fetch(`${deploymentUrl}/api/admin/seed`, {
      method: 'POST',
      headers,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ Admin user seeded successfully!')
    console.log('Result:', result)
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error)
    console.error('You can manually seed by calling:')
    console.error(`  POST ${deploymentUrl}/api/admin/seed`)
    if (seedToken) {
      console.error(`  Header: Authorization: Bearer ${seedToken}`)
    }
    process.exit(1)
  }
}

seedAfterDeployment()

