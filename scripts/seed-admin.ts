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
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

