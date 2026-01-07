import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// This script is specifically for build-time seeding
// It will only seed if DATABASE_URL is available

async function seedAdmin() {
  // Only seed if DATABASE_URL is set and valid
  const databaseUrl = process.env.DATABASE_URL?.trim()
  
  if (!databaseUrl || databaseUrl === '') {
    console.log('⚠️  DATABASE_URL not set - skipping admin seed during build')
    console.log('   Admin user will need to be created after deployment')
    console.log('   Run "npm run seed-admin" after setting DATABASE_URL')
    return // Exit successfully
  }

  // Check if it's a valid database URL (not just "file:" or empty)
  if (databaseUrl.startsWith('file:') && databaseUrl.length < 10) {
    console.log('⚠️  Invalid DATABASE_URL - skipping admin seed during build')
    console.log('   Admin user will need to be created after deployment')
    return // Exit successfully
  }

  let prisma: PrismaClient | null = null
  
  try {
    prisma = new PrismaClient()
    
    const username = 'admin'
    const password = 'admin123'

    const passwordHash = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.upsert({
      where: { username },
      update: {
        passwordHash,
      },
      create: {
        username,
        passwordHash,
      },
    })

    console.log(`✅ Default admin user "${username}" created/updated successfully!`)
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
    console.log('   ⚠️  Please change the default password after first login!')
  } catch (error) {
    // During build, don't fail the build if seeding fails
    console.warn('⚠️  Could not seed admin user during build:', error instanceof Error ? error.message : error)
    console.warn('   This is normal if the database is not yet set up or not accessible during build')
    console.warn('   Run "npm run seed-admin" after deployment to create the admin user')
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
}

// Wrap in try-catch to ensure we never fail the build
seedAdmin()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.warn('⚠️  Seeding script error (non-fatal):', error instanceof Error ? error.message : error)
    process.exit(0) // Always exit successfully to not break build
  })

