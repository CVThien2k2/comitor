import { Injectable, Logger } from "@nestjs/common"
import type { GoldenProfile, AccountCustomer, Conversation } from "@workspace/database"
import { PrismaService } from "src/database/prisma.service"
import { ProfileFetcherRegistry } from "src/platform/profile-fetchers/profile-fetcher.registry"
import type { Message } from "src/utils/types"

@Injectable()
export class IncomingMessageHandler {
  private readonly logger = new Logger(IncomingMessageHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileFetcherRegistry: ProfileFetcherRegistry
  ) {}

  async handle(message: Message) {
    const { provider, senderId, recipientId, conversationId: externalConversationId } = message

    // 1. Tìm LinkedAccount (ngoài transaction vì chỉ đọc)
    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: recipientId, provider },
    })

    if (!linkedAccount) {
      this.logger.warn(`Không tìm thấy LinkedAccount: provider=${provider}, accountId=${recipientId}`)
      return
    }

    // 2. Lấy profile từ provider (gọi API bên ngoài, không nằm trong transaction)
    const fetcher = this.profileFetcherRegistry.get(provider)
    const profileData = fetcher ? await fetcher.getProfile(senderId) : {}

    // 3. Transaction: getOrCreate GoldenProfile → AccountCustomer → Conversation → Message
    const dbMessage = await this.prisma.client.$transaction(async (tx) => {
      // GoldenProfile: match theo email/phone hoặc tạo mới
      let goldenProfile: GoldenProfile | null = null

      if (profileData.primaryEmail || profileData.primaryPhone) {
        const conditions: { primaryEmail?: string; primaryPhone?: string }[] = []
        if (profileData.primaryEmail) conditions.push({ primaryEmail: profileData.primaryEmail })
        if (profileData.primaryPhone) conditions.push({ primaryPhone: profileData.primaryPhone })

        goldenProfile = await tx.goldenProfile.findFirst({ where: { OR: conditions } })
      }

      if (!goldenProfile) {
        goldenProfile = await tx.goldenProfile.create({
          data: {
            fullName: profileData.fullName,
            gender: profileData.gender,
            dateOfBirth: profileData.dateOfBirth,
            primaryPhone: profileData.primaryPhone,
            primaryEmail: profileData.primaryEmail,
            address: profileData.address,
            city: profileData.city,
          },
        })
      }

      // AccountCustomer: tìm hoặc tạo
      let accountCustomer = await tx.accountCustomer.findFirst({
        where: { accountId: senderId, linkedAccountId: linkedAccount.id },
      })

      if (!accountCustomer) {
        accountCustomer = await tx.accountCustomer.create({
          data: {
            accountId: senderId,
            linkedAccountId: linkedAccount.id,
            goldenProfileId: goldenProfile.id,
          },
        })
      }

      // Conversation: tìm hoặc tạo
      let conversation = await tx.conversation.findFirst({
        where: { externalId: externalConversationId, linkedAccountId: linkedAccount.id },
      })

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            externalId: externalConversationId,
            linkedAccountId: linkedAccount.id,
            accountCustomerId: accountCustomer.id,
            type: "personal",
            tag: "other",
          },
        })

        await tx.conversationCustomer.create({
          data: {
            conversationId: conversation.id,
            accountCustomerId: accountCustomer.id,
          },
        })
      }

      // Message: tạo mới
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderType: "customer",
          accountCustomerId: accountCustomer.id,
          externalId: message.messageId,
          content: message.text,
          status: "success",
          attachments: message.attachments?.length
            ? {
                createMany: {
                  data: message.attachments.map((a) => ({
                    fileName: a.name,
                    fileType: a.type,
                    fileUrl: a.url,
                    thumbnailUrl: a.thumbnail,
                    fileMimeType: a.mimeType,
                  })),
                },
              }
            : undefined,
        },
      })

      await tx.conversation.update({
        where: { id: conversation.id },
        data: { lastActivityAt: new Date() },
      })

      return msg
    })

    this.logger.log(`Đã lưu tin nhắn inbound: ${dbMessage.id} (external: ${message.messageId})`)

    return dbMessage
  }
}
