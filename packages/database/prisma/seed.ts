import "dotenv/config"
import { PrismaClient } from "../src/generated/client"
import { hashSync } from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEFAULT_PASSWORD = hashSync("123456", 10)

async function main() {
  // Seed roles
  const roles = [
    { name: "admin", description: "Quản trị hệ thống" },
    { name: "manager", description: "Quản lý" },
    { name: "member", description: "Thành viên" },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }
  console.log(`Seeded ${roles.length} roles`)

  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } })

  // Seed users
  const users = [
    {
      name: "Admin",
      email: "admin@comitor.io",
      username: "admin",
      password: DEFAULT_PASSWORD,
      roleId: adminRole?.id,
    },
    {
      name: "Alice Nguyễn",
      email: "alice@comitor.io",
      username: "alice",
      password: DEFAULT_PASSWORD,
    },
    {
      name: "Bob Trần",
      email: "bob@comitor.io",
      username: "bob",
      password: DEFAULT_PASSWORD,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    })
  }
  console.log(`Seeded ${users.length} users (password: 123456)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
