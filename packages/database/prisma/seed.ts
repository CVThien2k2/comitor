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

  // ─── Users ─────────────────────────────────────────────
  const users = [
    { name: "System", email: "system@comitor.io", username: "admin", password: DEFAULT_PASSWORD, roleId: systemRole.id },
    { name: "Alice Nguyễn", email: "alice@comitor.io", username: "alice", password: DEFAULT_PASSWORD, roleId: adminRole.id },
    { name: "Bob Trần", email: "bob@comitor.io", username: "bob", password: DEFAULT_PASSWORD, roleId: userRole.id },
    { name: "Charlie Lê", email: "charlie@comitor.io", username: "charlie", password: DEFAULT_PASSWORD, roleId: userRole.id },
    { name: "Diana Phạm", email: "diana@comitor.io", username: "diana", password: DEFAULT_PASSWORD, roleId: adminRole.id },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { roleId: user.roleId },
      create: user,
    })
  }
  const createdUsers = await prisma.user.findMany()
  const userMap = new Map(createdUsers.map((u) => [u.username, u]))
  console.log(`Seeded ${users.length} users (password: 123456)`)

  // ─── Golden Profiles ───────────────────────────────────
  const goldenProfiles = [
    { fullName: "Nguyễn Văn An", gender: "male" as const, primaryPhone: "0901234567", primaryEmail: "an.nguyen@gmail.com", city: "Hồ Chí Minh", customerType: "individual" as const, memberTier: "gold" as const },
    { fullName: "Trần Thị Bình", gender: "female" as const, primaryPhone: "0912345678", primaryEmail: "binh.tran@gmail.com", city: "Hà Nội", customerType: "individual" as const, memberTier: "silver" as const },
    { fullName: "Lê Hoàng Cường", gender: "male" as const, primaryPhone: "0923456789", primaryEmail: "cuong.le@gmail.com", city: "Đà Nẵng", customerType: "business" as const, memberTier: "platinum" as const },
    { fullName: "Phạm Minh Dũng", gender: "male" as const, primaryPhone: "0934567890", primaryEmail: "dung.pham@gmail.com", city: "Hồ Chí Minh", customerType: "individual" as const },
    { fullName: "Võ Thị Em", gender: "female" as const, primaryPhone: "0945678901", primaryEmail: "em.vo@gmail.com", city: "Cần Thơ", customerType: "individual" as const, memberTier: "bronze" as const },
  ]

  for (const gp of goldenProfiles) {
    await prisma.goldenProfile.create({ data: gp })
  }
  const createdProfiles = await prisma.goldenProfile.findMany()
  console.log(`Seeded ${goldenProfiles.length} golden profiles`)

  // ─── Link Accounts ─────────────────────────────────────
  const systemUser = userMap.get("admin")!
  const aliceUser = userMap.get("alice")!

  const linkAccounts = [
    { provider: "zalo_oa" as const, linkedByUserId: systemUser.id, displayName: "Comitor Zalo OA", accountId: "zalo_oa_001" },
    { provider: "facebook" as const, linkedByUserId: systemUser.id, displayName: "Comitor Facebook", accountId: "fb_001" },
    { provider: "zalo_personal" as const, linkedByUserId: aliceUser.id, displayName: "Alice Zalo", accountId: "zalo_personal_001" },
  ]

  for (const la of linkAccounts) {
    await prisma.linkAccount.create({ data: la })
  }
  const createdLinkAccounts = await prisma.linkAccount.findMany()
  console.log(`Seeded ${linkAccounts.length} link accounts`)

  // ─── Account Customers ─────────────────────────────────
  const zaloOA = createdLinkAccounts.find((la) => la.accountId === "zalo_oa_001")!
  const facebook = createdLinkAccounts.find((la) => la.accountId === "fb_001")!

  const accountCustomers = [
    { accountId: "cust_zalo_001", linkedAccountId: zaloOA.id, goldenProfileId: createdProfiles[0].id, avatarUrl: null },
    { accountId: "cust_zalo_002", linkedAccountId: zaloOA.id, goldenProfileId: createdProfiles[1].id, avatarUrl: null },
    { accountId: "cust_fb_001", linkedAccountId: facebook.id, goldenProfileId: createdProfiles[2].id, avatarUrl: null },
    { accountId: "cust_zalo_003", linkedAccountId: zaloOA.id, goldenProfileId: createdProfiles[3].id, avatarUrl: null },
    { accountId: "cust_fb_002", linkedAccountId: facebook.id, goldenProfileId: createdProfiles[4].id, avatarUrl: null },
  ]

  for (const ac of accountCustomers) {
    await prisma.accountCustomer.create({ data: ac })
  }
  const createdAccountCustomers = await prisma.accountCustomer.findMany()
  console.log(`Seeded ${accountCustomers.length} account customers`)

  // ─── Conversations ─────────────────────────────────────
  const conversations = [
    { linkedAccountId: zaloOA.id, name: "Nguyễn Văn An", type: "personal" as const, tag: "business" as const, journeyState: "searching" as const, accountCustomerId: createdAccountCustomers[0].id, lastActivityAt: new Date("2026-03-17T08:00:00Z") },
    { linkedAccountId: zaloOA.id, name: "Trần Thị Bình", type: "personal" as const, tag: "other" as const, accountCustomerId: createdAccountCustomers[1].id, lastActivityAt: new Date("2026-03-17T09:30:00Z") },
    { linkedAccountId: facebook.id, name: "Lê Hoàng Cường", type: "personal" as const, tag: "business" as const, journeyState: "ticketed" as const, accountCustomerId: createdAccountCustomers[2].id, lastActivityAt: new Date("2026-03-16T15:00:00Z") },
    { linkedAccountId: zaloOA.id, name: "Phạm Minh Dũng", type: "personal" as const, tag: "other" as const, journeyState: "holding" as const, accountCustomerId: createdAccountCustomers[3].id, lastActivityAt: new Date("2026-03-15T10:00:00Z") },
    { linkedAccountId: facebook.id, name: "Võ Thị Em", type: "personal" as const, tag: "business" as const, journeyState: "searching" as const, accountCustomerId: createdAccountCustomers[4].id, lastActivityAt: new Date("2026-03-17T10:00:00Z") },
    { linkedAccountId: zaloOA.id, name: "Nhóm tư vấn tour Đà Lạt", type: "group" as const, tag: "business" as const, idGroup: "group_001", lastActivityAt: new Date("2026-03-17T07:00:00Z") },
  ]

  for (const conv of conversations) {
    await prisma.conversation.create({ data: conv })
  }
  const createdConversations = await prisma.conversation.findMany({ orderBy: { createdAt: "asc" } })
  console.log(`Seeded ${conversations.length} conversations`)

  // ─── Conversation Customers ────────────────────────────
  const conversationCustomers = [
    { conversationId: createdConversations[0].id, accountCustomerId: createdAccountCustomers[0].id },
    { conversationId: createdConversations[1].id, accountCustomerId: createdAccountCustomers[1].id },
    { conversationId: createdConversations[2].id, accountCustomerId: createdAccountCustomers[2].id },
    { conversationId: createdConversations[3].id, accountCustomerId: createdAccountCustomers[3].id },
    { conversationId: createdConversations[4].id, accountCustomerId: createdAccountCustomers[4].id },
    // Nhóm: nhiều khách
    { conversationId: createdConversations[5].id, accountCustomerId: createdAccountCustomers[0].id, isAdmin: true },
    { conversationId: createdConversations[5].id, accountCustomerId: createdAccountCustomers[1].id },
    { conversationId: createdConversations[5].id, accountCustomerId: createdAccountCustomers[3].id },
  ]

  for (const cc of conversationCustomers) {
    await prisma.conversationCustomer.create({ data: cc })
  }
  console.log(`Seeded ${conversationCustomers.length} conversation customers`)

  // ─── Messages ──────────────────────────────────────────
  const bobUser = userMap.get("bob")!

  const messages = [
    // Conversation 1: An hỏi tour
    { conversationId: createdConversations[0].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[0].id, content: "Xin chào, tôi muốn hỏi về tour Đà Lạt 3 ngày 2 đêm", status: "success" as const, createdAt: new Date("2026-03-17T08:00:00Z") },
    { conversationId: createdConversations[0].id, senderType: "agent" as const, userId: aliceUser.id, content: "Chào anh An! Dạ bên em có tour Đà Lạt 3N2Đ giá 2.500.000đ/người ạ. Anh muốn đi ngày nào ạ?", status: "success" as const, createdAt: new Date("2026-03-17T08:02:00Z") },
    { conversationId: createdConversations[0].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[0].id, content: "Tour bao gồm những gì vậy?", status: "success" as const, createdAt: new Date("2026-03-17T08:05:00Z") },
    { conversationId: createdConversations[0].id, senderType: "agent" as const, userId: aliceUser.id, content: "Tour bao gồm xe đưa đón, khách sạn 3 sao, ăn sáng, hướng dẫn viên và vé tham quan các điểm: Thung lũng Tình Yêu, Langbiang, chùa Linh Phước ạ", status: "success" as const, createdAt: new Date("2026-03-17T08:07:00Z") },

    // Conversation 2: Bình hỏi vé máy bay
    { conversationId: createdConversations[1].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[1].id, content: "Cho mình hỏi giá vé máy bay HN - SGN ngày 25/3 với", status: "success" as const, createdAt: new Date("2026-03-17T09:30:00Z") },
    { conversationId: createdConversations[1].id, senderType: "agent" as const, userId: bobUser.id, content: "Chào chị Bình! Em check giá cho chị nhé, chờ em 1 chút ạ", status: "success" as const, createdAt: new Date("2026-03-17T09:32:00Z") },
    { conversationId: createdConversations[1].id, senderType: "agent" as const, userId: bobUser.id, content: "Dạ ngày 25/3 có các chuyến:\n- VN 201: 06:00 - 08:10 | 1.200.000đ\n- VJ 123: 09:30 - 11:40 | 890.000đ\n- BB 456: 14:00 - 16:10 | 950.000đ\nChị muốn đặt chuyến nào ạ?", status: "success" as const, createdAt: new Date("2026-03-17T09:35:00Z") },

    // Conversation 3: Cường - đã có vé
    { conversationId: createdConversations[2].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[2].id, content: "Tôi muốn đặt tour teambuilding cho công ty 30 người", status: "success" as const, createdAt: new Date("2026-03-16T14:00:00Z") },
    { conversationId: createdConversations[2].id, senderType: "agent" as const, userId: aliceUser.id, content: "Chào anh Cường! Tour teambuilding 30 người bên em báo giá 45.000.000đ bao gồm xe, khách sạn, team building activities và ăn uống. Anh xem qua proposal em gửi nhé!", status: "success" as const, createdAt: new Date("2026-03-16T14:15:00Z") },
    { conversationId: createdConversations[2].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[2].id, content: "OK, công ty đồng ý. Chuyển khoản đặt cọc 50% nhé", status: "success" as const, createdAt: new Date("2026-03-16T15:00:00Z") },

    // Conversation 4: Dũng - holding
    { conversationId: createdConversations[3].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[3].id, content: "Tour Phú Quốc cuối tuần này còn chỗ không?", status: "success" as const, createdAt: new Date("2026-03-15T10:00:00Z") },

    // Conversation 5: Em - đang tìm
    { conversationId: createdConversations[4].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[4].id, content: "Hi, mình muốn tìm tour châu Âu tháng 6", status: "success" as const, createdAt: new Date("2026-03-17T10:00:00Z") },
    { conversationId: createdConversations[4].id, senderType: "agent" as const, userId: aliceUser.id, content: "Chào chị Em! Tháng 6 bên em có 2 tour châu Âu:\n1. Pháp - Thụy Sĩ - Ý 10N9Đ: 52.000.000đ\n2. Đức - Hà Lan - Bỉ 8N7Đ: 45.000.000đ\nChị quan tâm tour nào ạ?", status: "success" as const, createdAt: new Date("2026-03-17T10:05:00Z") },

    // Conversation 6: Nhóm tư vấn
    { conversationId: createdConversations[5].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[0].id, content: "Mọi người ơi, ai đi tour Đà Lạt không?", status: "success" as const, createdAt: new Date("2026-03-17T06:50:00Z") },
    { conversationId: createdConversations[5].id, senderType: "customer" as const, accountCustomerId: createdAccountCustomers[1].id, content: "Mình đi nè! Đi ngày nào vậy?", status: "success" as const, createdAt: new Date("2026-03-17T06:55:00Z") },
    { conversationId: createdConversations[5].id, senderType: "agent" as const, userId: bobUser.id, content: "Chào mọi người! Tour Đà Lạt gần nhất khởi hành ngày 22/3 ạ. Nhóm mình bao nhiêu người để em báo giá nhé!", status: "success" as const, createdAt: new Date("2026-03-17T07:00:00Z") },
  ]

  for (const msg of messages) {
    await prisma.message.create({ data: msg })
  }
  console.log(`Seeded ${messages.length} messages`)

  // ─── Message Attachments ───────────────────────────────
  const allMessages = await prisma.message.findMany({ orderBy: { createdAt: "asc" } })

  const attachments = [
    { messageId: allMessages[9].id, fileName: "proposal-teambuilding.pdf", fileType: "file", fileUrl: "https://storage.comitor.io/files/proposal-teambuilding.pdf", fileMimeType: "application/pdf" },
    { messageId: allMessages[13].id, fileName: "tour-chau-au-brochure.jpg", fileType: "image", fileUrl: "https://storage.comitor.io/images/tour-chau-au-brochure.jpg", thumbnailUrl: "https://storage.comitor.io/thumbs/tour-chau-au-brochure.jpg", fileMimeType: "image/jpeg" },
  ]

  for (const att of attachments) {
    await prisma.messageAttachment.create({ data: att })
  }
  console.log(`Seeded ${attachments.length} message attachments`)

  console.log("\nSeed completed!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
