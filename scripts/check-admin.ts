import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createPrismaClientWithAdapter } from '../lib/create-prisma-client'

const prisma = createPrismaClientWithAdapter()

async function checkAdmin() {
  try {
    console.log('Checking for admin user...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    const admin = await prisma.admin.findUnique({
      where: { username: 'admin' },
    })

    if (!admin) {
      console.log('❌ Admin user does not exist!')
      console.log('Run: npm run seed-admin')
      return
    }

    console.log('✅ Admin user exists!')
    console.log('Username:', admin.username)
    console.log('Created at:', admin.createdAt)
    
    // Test password
    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash)
    
    if (isValid) {
      console.log('✅ Password "admin123" is valid!')
    } else {
      console.log('❌ Password "admin123" does NOT match!')
      console.log('The password hash in database does not match "admin123"')
      console.log('Run: npm run seed-admin (to reset password)')
    }
  } catch (error) {
    console.error('Error checking admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()

