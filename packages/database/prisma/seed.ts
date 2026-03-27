import "dotenv/config"
import { PrismaClient } from "../src/generated/client"
import { hashSync } from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PERMISSION } from "../src/permissions"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEFAULT_PASSWORD = hashSync("123456", 10)

const DEFAULT_PERMISSIONS: { code: string; description: string }[] = Object.values(PERMISSION)

async function main() {
  // ─── Clean all data ────────────────────────────────────
  await prisma.messageAttachment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationCustomer.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.accountCustomer.deleteMany()
  await prisma.linkAccount.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.goldenProfile.deleteMany()
  console.log("Cleaned all data")

  // ─── Permissions ────────────────────────────────────────
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: { code: perm.code, description: perm.description },
    })
  }
  console.log(`Seeded ${DEFAULT_PERMISSIONS.length} permissions`)

  // ─── Roles ─────────────────────────────────────────────
  const rolesData = [
    { name: "system", description: "Hệ thống – toàn quyền" },
    { name: "admin", description: "Quản trị viên" },
    { name: "user", description: "Người dùng" },
  ]

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    })
  }
  console.log(`Seeded ${rolesData.length} roles`)

  const systemRole = (await prisma.role.findUnique({ where: { name: "system" } }))!
  const adminRole = (await prisma.role.findUnique({ where: { name: "admin" } }))!
  const userRole = (await prisma.role.findUnique({ where: { name: "user" } }))!

  const allPermissions = await prisma.permission.findMany()
  const permByCode = new Map(allPermissions.map((p) => [p.code, p]))

  // ─── Role ↔ Permission mapping ─────────────────────────
  const systemPermCodes = ["*"]
  const adminPermCodes = DEFAULT_PERMISSIONS.filter((p) => !p.code.includes("*")).map((p) => p.code)
  const userPermCodes = [
    "conversation:create",
    "conversation:read",
    "message:create",
    "message:read",
    "customer:read",
    "upload:create",
    "upload:read",
  ]

  const rolePermissions: { roleId: string; codes: string[] }[] = [
    { roleId: systemRole.id, codes: systemPermCodes },
    { roleId: adminRole.id, codes: adminPermCodes },
    { roleId: userRole.id, codes: userPermCodes },
  ]

  let rpCount = 0
  for (const { roleId, codes } of rolePermissions) {
    for (const code of codes) {
      const perm = permByCode.get(code)
      if (!perm) continue
      await prisma.rolePermission.upsert({
        where: { unique_role_permission: { roleId, permissionId: perm.id } },
        update: {},
        create: { roleId, permissionId: perm.id },
      })
      rpCount++
    }
  }
  console.log(`Seeded ${rpCount} role-permission mappings`)

  const users = [
    {
      name: "System",
      email: "system@comitor.io",
      username: "admin",
      password: DEFAULT_PASSWORD,
      roleId: systemRole.id,
    },
    {
      name: "Administrator",
      email: "admin@comitor.io",
      username: "administrator",
      password: DEFAULT_PASSWORD,
      roleId: adminRole.id,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { name: user.name, email: user.email, roleId: user.roleId },
      create: user,
    })
  }
  console.log(`Seeded ${users.length} system users (password: 123456)`)

  console.log("\nSeed completed!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
