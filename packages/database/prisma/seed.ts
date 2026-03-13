import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = [
    { email: 'admin@example.com', username: 'admin' },
    { email: 'alice@example.com', username: 'alice' },
    { email: 'bob@example.com', username: 'bob' },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log(`Seeded ${users.length} users`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
