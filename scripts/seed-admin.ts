import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use standard PrismaClient - works with both PostgreSQL and SQLite
// Prisma will automatically use DATABASE_URL from environment variables
const prisma = new PrismaClient()

async function main() {
  const username = process.argv[2] || 'admin'
  const password = process.argv[3] || 'admin123'

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

  console.log(`Admin user "${username}" created/updated successfully!`)
  console.log(`Username: ${username}`)
  console.log(`Password: ${password}`)
  console.log('\n⚠️  Please change the default password after first login!')
}

main()
  .catch((e) => {
    // During build, don't fail if DATABASE_URL is not set or database is unavailable
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build' ||
                        process.env.NEXT_PHASE === 'phase-export'
    
    if (isBuildTime || !process.env.DATABASE_URL) {
      console.warn('Skipping admin seed during build (DATABASE_URL not set or database unavailable)')
      console.warn('Admin user will need to be created manually after deployment')
      process.exit(0) // Exit successfully during build
    } else {
      console.error('Error seeding admin user:', e)
      process.exit(1) // Fail in other contexts
    }
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

