import "dotenv/config"
import { PrismaClient } from "../src/generated/client"
import { hashSync } from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { randomUUID } from "node:crypto"
import { PERMISSION } from "../src/permissions"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEFAULT_PASSWORD = hashSync("123456", 10)
const SYSTEM_ADMIN = {
  id: randomUUID(),
  name: "System Admin",
  email: "systemadmin@comitor.io",
  username: "systemadmin",
  password: DEFAULT_PASSWORD,
}
const SYSTEM_ROLE = {
  name: "system",
  description: "Hệ thống – toàn quyền",
}
const DEFAULT_PERMISSIONS: { code: string; description: string }[] = Object.values(PERMISSION)

const TABLES_TO_TRUNCATE = [
  "conversation_session_assignees",
  "conversation_processing_sessions",
  "message_attachments",
  "messages",
  "conversation_customers",
  "conversations",
  "account_customer",
  "link_accounts",
  "refresh_tokens",
  "role_permissions",
  "permissions",
  "roles",
  "agent_levels",
  "suggested_messages",
  "golden_profiles",
  "user",
]

async function truncateTableIfExists(tableName: string) {
  await prisma.$executeRawUnsafe(
    `DO $$
     BEGIN
       IF to_regclass('public.${tableName}') IS NOT NULL THEN
         EXECUTE 'TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE';
       END IF;
     END
     $$;`,
  )
}

async function main() {
  // ─── Clean all data ────────────────────────────────────
  for (const tableName of TABLES_TO_TRUNCATE) {
    await truncateTableIfExists(tableName)
  }
  console.log("Cleaned all data")

  // ─── 1) Create one system admin user ───────────────────
  // createdBy is required, so the bootstrap user self-references by id.
  await prisma.user.createMany({
    data: [
      {
        id: SYSTEM_ADMIN.id,
        name: SYSTEM_ADMIN.name,
        email: SYSTEM_ADMIN.email,
        username: SYSTEM_ADMIN.username,
        password: SYSTEM_ADMIN.password,
        createdBy: SYSTEM_ADMIN.id,
      },
    ],
  })
  const systemAdmin = await prisma.user.findUniqueOrThrow({ where: { id: SYSTEM_ADMIN.id } })
  console.log("Created systemadmin user")

  // ─── 2) Create system role ─────────────────────────────
  const systemRole = await prisma.role.create({
    data: {
      name: SYSTEM_ROLE.name,
      description: SYSTEM_ROLE.description,
      createdBy: systemAdmin.id,
    },
  })
  console.log("Created system role")

  // ─── 3) Create all permissions ─────────────────────────
  for (const permission of DEFAULT_PERMISSIONS) {
    await prisma.permission.create({
      data: {
        code: permission.code,
        description: permission.description,
        createdBy: systemAdmin.id,
      },
    })
  }
  const fullPermission = await prisma.permission.findUniqueOrThrow({ where: { code: "*" } })
  console.log(`Created ${DEFAULT_PERMISSIONS.length} permissions`)

  // ─── 4) Attach role to user + attach full permission ───
  await prisma.user.update({
    where: { id: systemAdmin.id },
    data: { roleId: systemRole.id },
  })
  await prisma.rolePermission.create({
    data: {
      roleId: systemRole.id,
      permissionId: fullPermission.id,
    },
  })
  console.log("Attached role and full permission")

  console.log("\nSeed completed!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
