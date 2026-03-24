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

  // ─── Golden Profiles (100 khách hàng) ──────────────────
  const systemUser = userMap.get("admin")!
  const aliceUser = userMap.get("alice")!
  const bobUser = userMap.get("bob")!

  const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"]
  const maleNames = ["Văn An", "Minh Dũng", "Hoàng Cường", "Quốc Bảo", "Đức Huy", "Thanh Tùng", "Anh Khoa", "Hữu Phát", "Trọng Nhân", "Tiến Đạt"]
  const femaleNames = ["Thị Bình", "Thị Em", "Mai Lan", "Ngọc Hà", "Thuỳ Linh", "Phương Anh", "Thanh Hương", "Kim Chi", "Bích Ngọc", "Hồng Nhung"]
  const cities = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Huế", "Nha Trang", "Hải Phòng", "Biên Hoà", "Vũng Tàu", "Đà Lạt"]
  const tiers = ["bronze", "silver", "gold", "platinum", undefined] as const
  const customerTypes = ["individual", "business"] as const

  const TOTAL_CUSTOMERS = 100

  for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
    const isMale = i % 2 === 0
    const lastName = lastNames[i % lastNames.length]
    const firstName = isMale ? maleNames[i % maleNames.length] : femaleNames[i % femaleNames.length]
    const fullName = `${lastName} ${firstName}`
    const phone = `09${String(i).padStart(8, "0")}`

    await prisma.goldenProfile.create({
      data: {
        fullName,
        gender: isMale ? "male" : "female",
        primaryPhone: phone,
        primaryEmail: `customer${i}@gmail.com`,
        city: cities[i % cities.length],
        customerType: customerTypes[i % customerTypes.length],
        memberTier: tiers[i % tiers.length],
      },
    })
  }
  const createdProfiles = await prisma.goldenProfile.findMany({ orderBy: { createdAt: "asc" } })
  console.log(`Seeded ${createdProfiles.length} golden profiles`)

  // ─── Link Accounts ─────────────────────────────────────
  const linkAccounts = [
    { provider: "zalo_oa" as const, linkedByUserId: systemUser.id, displayName: "Comitor Zalo OA", accountId: "zalo_oa_001", providerCredentialsId: "" },
    { provider: "facebook" as const, linkedByUserId: systemUser.id, displayName: "Comitor Facebook", accountId: "fb_001", providerCredentialsId: "" },
    { provider: "zalo_personal" as const, linkedByUserId: aliceUser.id, displayName: "Alice Zalo", accountId: "zalo_personal_001", providerCredentialsId: "" },
  ]

  for (const la of linkAccounts) {
    await prisma.linkAccount.create({ data: la })
  }
  const createdLinkAccounts = await prisma.linkAccount.findMany()
  const zaloOA = createdLinkAccounts.find((la) => la.accountId === "zalo_oa_001")!
  const facebook = createdLinkAccounts.find((la) => la.accountId === "fb_001")!
  const zaloPersonal = createdLinkAccounts.find((la) => la.accountId === "zalo_personal_001")!
  const linkedAccountPool = [zaloOA, facebook, zaloPersonal]
  console.log(`Seeded ${linkAccounts.length} link accounts`)

  // ─── Account Customers (100, mỗi profile 1 account) ───
  for (let i = 0; i < createdProfiles.length; i++) {
    const la = linkedAccountPool[i % linkedAccountPool.length]!
    await prisma.accountCustomer.create({
      data: {
        accountId: `cust_${la.provider}_${String(i).padStart(3, "0")}`,
        linkedAccountId: la.id,
        goldenProfileId: createdProfiles[i]!.id,
        avatarUrl: null,
      },
    })
  }
  const createdAccountCustomers = await prisma.accountCustomer.findMany({ orderBy: { createdAt: "asc" } })
  console.log(`Seeded ${createdAccountCustomers.length} account customers`)

  // ─── Conversations (90 personal + 10 group = 100) ─────
  const TOTAL_CONVERSATIONS = 100
  const TOTAL_GROUPS = 10
  const tags = ["business", "other"] as const
  const journeyStates = ["searching", "ticketed", "holding", null] as const
  const agents = [aliceUser, bobUser]
  const baseDate = new Date("2026-03-10T08:00:00Z")

  // 90 cuộc personal
  for (let i = 0; i < TOTAL_CONVERSATIONS - TOTAL_GROUPS; i++) {
    const ac = createdAccountCustomers[i % createdAccountCustomers.length]!
    const la = linkedAccountPool[i % linkedAccountPool.length]!
    const profile = createdProfiles[i % createdProfiles.length]!
    const activityDate = new Date(baseDate.getTime() + i * 30 * 60 * 1000) // cách 30 phút

    await prisma.conversation.create({
      data: {
        linkedAccountId: la.id,
        name: profile.fullName,
        type: "personal",
        tag: tags[i % tags.length],
        journeyState: journeyStates[i % journeyStates.length],
        accountCustomerId: ac.id,
        lastActivityAt: activityDate,
      },
    })
  }

  // 10 cuộc group
  for (let i = 0; i < TOTAL_GROUPS; i++) {
    const la = linkedAccountPool[i % linkedAccountPool.length]!
    const activityDate = new Date(baseDate.getTime() + (90 + i) * 30 * 60 * 1000)

    await prisma.conversation.create({
      data: {
        linkedAccountId: la.id,
        name: `Nhóm tư vấn ${i + 1}`,
        type: "group",
        tag: tags[i % tags.length],
        externalId: `group_${String(i + 1).padStart(3, "0")}`,
        lastActivityAt: activityDate,
      },
    })
  }

  const createdConversations = await prisma.conversation.findMany({ orderBy: { createdAt: "asc" } })
  console.log(`Seeded ${createdConversations.length} conversations`)

  // ─── Conversation Customers ────────────────────────────
  for (const conv of createdConversations) {
    if (conv.type === "personal" && conv.accountCustomerId) {
      await prisma.conversationCustomer.create({
        data: { conversationId: conv.id, accountCustomerId: conv.accountCustomerId },
      })
    } else if (conv.type === "group") {
      // Mỗi nhóm 3 thành viên ngẫu nhiên
      const memberCount = 3
      const startIdx = createdConversations.indexOf(conv) % createdAccountCustomers.length
      for (let j = 0; j < memberCount; j++) {
        const ac = createdAccountCustomers[(startIdx + j) % createdAccountCustomers.length]!
        await prisma.conversationCustomer.create({
          data: {
            conversationId: conv.id,
            accountCustomerId: ac.id,
            isAdmin: j === 0,
          },
        })
      }
    }
  }
  console.log(`Seeded conversation customers`)

  // ─── Messages (100 per conversation) ───────────────────
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

  let totalMessages = 0
  for (let ci = 0; ci < createdConversations.length; ci++) {
    const conv = createdConversations[ci]!
    const customer = createdAccountCustomers[ci % createdAccountCustomers.length]!
    const agent = agents[ci % agents.length]!
    const convBaseDate = new Date(baseDate.getTime() + ci * 30 * 60 * 1000)

    for (let i = 0; i < MESSAGES_PER_CONVERSATION; i++) {
      const isCustomer = i % 2 === 0
      const msgDate = new Date(convBaseDate.getTime() + i * 60 * 1000)

      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderType: isCustomer ? "customer" : "agent",
          accountCustomerId: isCustomer ? customer.id : undefined,
          userId: isCustomer ? undefined : agent.id,
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
