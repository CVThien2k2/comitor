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
    {
      name: "System",
      email: "system@comitor.io",
      username: "admin",
      password: DEFAULT_PASSWORD,
      roleId: systemRole.id,
    },
    {
      name: "Alice Nguyễn",
      email: "alice@comitor.io",
      username: "alice",
      password: DEFAULT_PASSWORD,
      roleId: adminRole.id,
    },
    { name: "Bob Trần", email: "bob@comitor.io", username: "bob", password: DEFAULT_PASSWORD, roleId: userRole.id },
    {
      name: "Charlie Lê",
      email: "charlie@comitor.io",
      username: "charlie",
      password: DEFAULT_PASSWORD,
      roleId: userRole.id,
    },
    {
      name: "Diana Phạm",
      email: "diana@comitor.io",
      username: "diana",
      password: DEFAULT_PASSWORD,
      roleId: adminRole.id,
    },
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
    {
      fullName: "Nguyễn Văn An",
      gender: "male" as const,
      primaryPhone: "0901234567",
      primaryEmail: "an.nguyen@gmail.com",
      city: "Hồ Chí Minh",
      customerType: "individual" as const,
      memberTier: "gold" as const,
    },
    {
      fullName: "Trần Thị Bình",
      gender: "female" as const,
      primaryPhone: "0912345678",
      primaryEmail: "binh.tran@gmail.com",
      city: "Hà Nội",
      customerType: "individual" as const,
      memberTier: "silver" as const,
    },
    {
      fullName: "Lê Hoàng Cường",
      gender: "male" as const,
      primaryPhone: "0923456789",
      primaryEmail: "cuong.le@gmail.com",
      city: "Đà Nẵng",
      customerType: "business" as const,
      memberTier: "platinum" as const,
    },
    {
      fullName: "Phạm Minh Dũng",
      gender: "male" as const,
      primaryPhone: "0934567890",
      primaryEmail: "dung.pham@gmail.com",
      city: "Hồ Chí Minh",
      customerType: "individual" as const,
    },
    {
      fullName: "Võ Thị Em",
      gender: "female" as const,
      primaryPhone: "0945678901",
      primaryEmail: "em.vo@gmail.com",
      city: "Cần Thơ",
      customerType: "individual" as const,
      memberTier: "bronze" as const,
    },
  ]

  for (const gp of goldenProfiles) {
    await prisma.goldenProfile.create({ data: gp })
  }
  const createdProfiles = await prisma.goldenProfile.findMany({ orderBy: { createdAt: "asc" } })
  if (createdProfiles.length < 5) {
    throw new Error(`Expected at least 5 golden profiles, got ${createdProfiles.length}`)
  }
  const gp0 = createdProfiles[0]!
  const gp1 = createdProfiles[1]!
  const gp2 = createdProfiles[2]!
  const gp3 = createdProfiles[3]!
  const gp4 = createdProfiles[4]!
  console.log(`Seeded ${goldenProfiles.length} golden profiles`)

  // ─── Link Accounts ─────────────────────────────────────
  const systemUser = userMap.get("admin")!
  const aliceUser = userMap.get("alice")!

  const linkAccounts = [
    {
      provider: "zalo_oa" as const,
      linkedByUserId: systemUser.id,
      displayName: "Comitor Zalo OA",
      accountId: "zalo_oa_001",
      providerCredentialsId: "",
    },
    {
      provider: "facebook" as const,
      linkedByUserId: systemUser.id,
      displayName: "Comitor Facebook",
      accountId: "fb_001",
      providerCredentialsId: "",
    },
    {
      provider: "zalo_personal" as const,
      linkedByUserId: aliceUser.id,
      displayName: "Alice Zalo",
      accountId: "zalo_personal_001",
      providerCredentialsId: "",
    },
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
    { accountId: "cust_zalo_001", linkedAccountId: zaloOA.id, goldenProfileId: gp0.id, avatarUrl: null },
    { accountId: "cust_zalo_002", linkedAccountId: zaloOA.id, goldenProfileId: gp1.id, avatarUrl: null },
    { accountId: "cust_fb_001", linkedAccountId: facebook.id, goldenProfileId: gp2.id, avatarUrl: null },
    { accountId: "cust_zalo_003", linkedAccountId: zaloOA.id, goldenProfileId: gp3.id, avatarUrl: null },
    { accountId: "cust_fb_002", linkedAccountId: facebook.id, goldenProfileId: gp4.id, avatarUrl: null },
  ]

  for (const ac of accountCustomers) {
    await prisma.accountCustomer.create({ data: ac })
  }
  const createdAccountCustomers = await prisma.accountCustomer.findMany({ orderBy: { createdAt: "asc" } })
  if (createdAccountCustomers.length < 5) {
    throw new Error(`Expected at least 5 account customers, got ${createdAccountCustomers.length}`)
  }
  const ac0 = createdAccountCustomers[0]!
  const ac1 = createdAccountCustomers[1]!
  const ac2 = createdAccountCustomers[2]!
  const ac3 = createdAccountCustomers[3]!
  const ac4 = createdAccountCustomers[4]!
  console.log(`Seeded ${accountCustomers.length} account customers`)

  // ─── Conversations ─────────────────────────────────────
  const conversations = [
    {
      linkedAccountId: zaloOA.id,
      name: "Nguyễn Văn An",
      type: "personal" as const,
      tag: "business" as const,
      journeyState: "searching" as const,
      accountCustomerId: ac0.id,
      lastActivityAt: new Date("2026-03-17T08:00:00Z"),
    },
    {
      linkedAccountId: zaloOA.id,
      name: "Trần Thị Bình",
      type: "personal" as const,
      tag: "other" as const,
      accountCustomerId: ac1.id,
      lastActivityAt: new Date("2026-03-17T09:30:00Z"),
    },
    {
      linkedAccountId: facebook.id,
      name: "Lê Hoàng Cường",
      type: "personal" as const,
      tag: "business" as const,
      journeyState: "ticketed" as const,
      accountCustomerId: ac2.id,
      lastActivityAt: new Date("2026-03-16T15:00:00Z"),
    },
    {
      linkedAccountId: zaloOA.id,
      name: "Phạm Minh Dũng",
      type: "personal" as const,
      tag: "other" as const,
      journeyState: "holding" as const,
      accountCustomerId: ac3.id,
      lastActivityAt: new Date("2026-03-15T10:00:00Z"),
    },
    {
      linkedAccountId: facebook.id,
      name: "Võ Thị Em",
      type: "personal" as const,
      tag: "business" as const,
      journeyState: "searching" as const,
      accountCustomerId: ac4.id,
      lastActivityAt: new Date("2026-03-17T10:00:00Z"),
    },
    {
      linkedAccountId: zaloOA.id,
      name: "Nhóm tư vấn tour Đà Lạt",
      type: "group" as const,
      tag: "business" as const,
      externalId: "group_001",
      lastActivityAt: new Date("2026-03-17T07:00:00Z"),
    },
  ]

  for (const conv of conversations) {
    await prisma.conversation.create({ data: conv })
  }
  const createdConversations = await prisma.conversation.findMany({ orderBy: { createdAt: "asc" } })
  if (createdConversations.length < 6) {
    throw new Error(`Expected at least 6 conversations, got ${createdConversations.length}`)
  }
  const c0 = createdConversations[0]!
  const c1 = createdConversations[1]!
  const c2 = createdConversations[2]!
  const c3 = createdConversations[3]!
  const c4 = createdConversations[4]!
  const c5 = createdConversations[5]!
  console.log(`Seeded ${conversations.length} conversations`)

  // ─── Conversation Customers ────────────────────────────
  const conversationCustomers = [
    { conversationId: c0.id, accountCustomerId: ac0.id },
    { conversationId: c1.id, accountCustomerId: ac1.id },
    { conversationId: c2.id, accountCustomerId: ac2.id },
    { conversationId: c3.id, accountCustomerId: ac3.id },
    { conversationId: c4.id, accountCustomerId: ac4.id },
    // Nhóm: nhiều khách
    { conversationId: c5.id, accountCustomerId: ac0.id, isAdmin: true },
    { conversationId: c5.id, accountCustomerId: ac1.id },
    { conversationId: c5.id, accountCustomerId: ac3.id },
  ]

  for (const cc of conversationCustomers) {
    await prisma.conversationCustomer.create({ data: cc })
  }
  console.log(`Seeded ${conversationCustomers.length} conversation customers`)

  // ─── Messages (100 per conversation) ───────────────────
  const bobUser = userMap.get("bob")!

  const MESSAGES_PER_CONVERSATION = 100

  const customerMessages = [
    "Xin chào, tôi muốn hỏi thêm thông tin",
    "Giá bao nhiêu vậy ạ?",
    "Có khuyến mãi gì không?",
    "Tour này bao gồm những gì?",
    "Mấy ngày mấy đêm vậy?",
    "Đi bao nhiêu người được giảm giá?",
    "Có bao gồm vé máy bay không?",
    "Khách sạn mấy sao vậy?",
    "Lịch trình cụ thể thế nào?",
    "Có bảo hiểm du lịch không?",
    "Thanh toán bằng cách nào?",
    "Có thể trả góp không ạ?",
    "Khi nào khởi hành?",
    "Hủy tour có mất phí không?",
    "Gửi cho tôi brochure được không?",
    "Tôi muốn đặt cho 4 người",
    "Có tour nào rẻ hơn không?",
    "Dịch vụ ăn uống thế nào?",
    "Có đón tận nơi không?",
    "OK, để tôi suy nghĩ thêm nhé",
  ]

  const agentMessages = [
    "Dạ chào anh/chị! Em có thể giúp gì ạ?",
    "Dạ bên em có nhiều gói tour phù hợp ạ",
    "Giá tour hiện tại là 2.500.000đ/người ạ",
    "Đang có chương trình giảm 10% cho nhóm từ 5 người ạ",
    "Tour bao gồm xe đưa đón, khách sạn, ăn sáng và vé tham quan ạ",
    "Tour 3 ngày 2 đêm ạ anh/chị",
    "Nhóm từ 10 người giảm 15% ạ",
    "Dạ vé máy bay tính riêng ạ",
    "Khách sạn 3-4 sao tùy gói ạ",
    "Em gửi lịch trình chi tiết cho anh/chị nhé",
    "Có bảo hiểm du lịch trong gói ạ",
    "Anh/chị có thể chuyển khoản hoặc thanh toán tại văn phòng ạ",
    "Dạ bên em có hỗ trợ trả góp 0% qua thẻ tín dụng ạ",
    "Tour gần nhất khởi hành ngày 22/3 ạ",
    "Hủy trước 7 ngày được hoàn 100% ạ",
    "Dạ em gửi qua email cho anh/chị nhé",
    "Em đã ghi nhận đặt chỗ cho 4 người ạ",
    "Dạ có tour tiết kiệm giá 1.800.000đ/người ạ",
    "Ăn sáng buffet, trưa và tối ăn theo thực đơn địa phương ạ",
    "Dạ có xe đón tận nhà trong nội thành ạ",
  ]

  const conversationConfigs = [
    { conv: c0, customer: ac0, agents: [aliceUser], baseDate: new Date("2026-03-17T08:00:00Z") },
    { conv: c1, customer: ac1, agents: [bobUser], baseDate: new Date("2026-03-17T09:00:00Z") },
    { conv: c2, customer: ac2, agents: [aliceUser], baseDate: new Date("2026-03-16T14:00:00Z") },
    { conv: c3, customer: ac3, agents: [bobUser, aliceUser], baseDate: new Date("2026-03-15T10:00:00Z") },
    { conv: c4, customer: ac4, agents: [aliceUser], baseDate: new Date("2026-03-17T10:00:00Z") },
    { conv: c5, customer: ac0, agents: [bobUser], baseDate: new Date("2026-03-17T06:00:00Z") },
  ]

  let totalMessages = 0
  for (const config of conversationConfigs) {
    for (let i = 0; i < MESSAGES_PER_CONVERSATION; i++) {
      const isCustomer = i % 2 === 0
      const msgDate = new Date(config.baseDate.getTime() + i * 60 * 1000) // 1 min apart

      await prisma.message.create({
        data: {
          conversationId: config.conv.id,
          senderType: isCustomer ? "customer" : "agent",
          accountCustomerId: isCustomer ? config.customer.id : undefined,
          userId: isCustomer ? undefined : config.agents[i % config.agents.length]!.id,
          content: isCustomer
            ? customerMessages[i % customerMessages.length]
            : agentMessages[i % agentMessages.length],
          status: "success",
          timestamp: msgDate,
          createdAt: msgDate,
        },
      })
      totalMessages++
    }
  }
  console.log(`Seeded ${totalMessages} messages (${MESSAGES_PER_CONVERSATION} per conversation)`)

  console.log("\nSeed completed!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
