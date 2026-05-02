import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { type MessagePlatform } from "src/utils/types"
import { QUEUE_NAMES } from "./queue.constants"
import { PrismaService } from "src/database/prisma.service"
import { AccountCustomer, type LinkAccount } from "@workspace/database"
import { AccountCustomerService } from "src/core/account-customer/account-customer.service"
import { ZaloInstanceRegistry } from "src/platform/zalo/zalo-instance.registry"
import { CONVERSATION_INCLUDE } from "src/core/message/include"
import { EVENTS } from "src/websocket/socket-events"
import { SocketGateway } from "src/websocket/socket.gateway"

type GroupConversationInfo = {
  name: string
  avatarUrl: string | null
}

type GroupConversationInfoResolver = (
  externalConversationId: string,
  linkedAccount: LinkAccount
) => Promise<GroupConversationInfo>

@Processor(QUEUE_NAMES.INCOMING_MESSAGE)
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name)

  private readonly groupConversationInfoResolvers: Partial<
    Record<MessagePlatform["provider"], GroupConversationInfoResolver>
  > = {
    zalo_personal: this.resolveZaloGroup.bind(this),
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountCustomerService: AccountCustomerService,
    private readonly zaloInstanceRegistry: ZaloInstanceRegistry,
    private readonly socketGateway: SocketGateway
  ) {
    super()
  }

  async process(job: Job<MessagePlatform>) {
    const {
      provider, //Nền tảng
      typeConversation, //Loại cuộc hội thoại
      externalConversationId, //ID cuộc hội thoại trên nền tảng
      externalMessageId, //ID tin nhắn trên nền tảng
      accountCustomerId, //ID tài khoản khách hàng
      linkedAccountId, //ID tài khoản hệ thống nhận về tin nhắn này
      senderType, //Loại người gửi tin nhắn
      timestamp, //Thời gian tin nhắn
      type, //Loại tin nhắn
      content, //Nội dung tin nhắn
    } = job.data
    try {
      // Check tin nhắn đã có external id → đã xử lý rồi thì bỏ qua
      const existingMessage = await this.prisma.client.message.findFirst({
        where: { externalId: externalMessageId },
      })
      if (existingMessage) return
      // Check tài khoản liên kết tồn tại
      const linkedAccount = await this.prisma.client.linkAccount.findFirst({
        where: {
          provider,
          status: "active",
          isDeleted: false,
          OR: [{ accountId: linkedAccountId }],
        },
      })
      if (!linkedAccount) return

      const ts = new Date(timestamp)
      const messageTimestamp = Number.isNaN(ts.getTime()) ? new Date() : ts
      const conversationIdentity = {
        linkedAccountId: linkedAccount.id,
        externalId: externalConversationId,
      } as const
      const existingConversation = await this.prisma.client.conversation.findUnique({
        where: { linked_account_external_id: conversationIdentity },
        select: { id: true },
      })
      const isNewConversation = !existingConversation
      let groupConversationInfo: GroupConversationInfo | null = null
      if (isNewConversation && typeConversation === "group") {
        try {
          groupConversationInfo = await this.resolveGroupConversationInfo(
            provider,
            externalConversationId,
            linkedAccount
          )
        } catch (error) {
          this.logger.warn(
            `[MessageProcessor] Không lấy được thông tin nhóm ${externalConversationId}, dùng fallback: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
          groupConversationInfo = {
            name: "Nhóm hội thoại",
            avatarUrl: null,
          }
        }
      }
      let realtimeConversation: any = null

      await this.prisma.client.$transaction(async (tx) => {
        const isCustomerMessage = senderType === "customer"

        let accountCustomer: AccountCustomer | null = null
        if (accountCustomerId) {
          accountCustomer = await this.accountCustomerService.getOrCreate(
            { accountId: accountCustomerId, linkedAccount },
            tx
          )
          if (!accountCustomer) throw new Error("Không tìm thấy tài khoản khách hàng")
        }

        const messageCreateData = {
          senderType,
          externalId: externalMessageId,
          timestamp: messageTimestamp,
          type,
          content,
          status: "success" as const,
          ...(senderType === "customer" && accountCustomer
            ? { accountCustomer: { connect: { id: accountCustomer.id } } }
            : {}),
        }

        const conversation = await tx.conversation.upsert({
          where: {
            linked_account_external_id: conversationIdentity,
          },
          create: {
            linkedAccountId: linkedAccount.id,
            externalId: externalConversationId,
            type: typeConversation,
            ...(typeConversation === "group"
              ? (groupConversationInfo ?? {
                  name: "Nhóm hội thoại",
                  avatarUrl: null,
                })
              : {
                  name: accountCustomer?.name || "Khách hàng",
                  avatarUrl: accountCustomer?.avatarUrl ?? null,
                }),
            status: "pending",
            isUnread: isCustomerMessage,
            countUnreadMessages: isCustomerMessage ? 1 : 0,
            lastActivityAt: messageTimestamp,
            messages: { create: messageCreateData as any },
          },
          update: {
            isUnread: isCustomerMessage,
            countUnreadMessages: isCustomerMessage ? { increment: 1 } : 0,
            lastActivityAt: messageTimestamp,
            messages: { create: messageCreateData as any },
          },
          include: CONVERSATION_INCLUDE,
        })
        realtimeConversation = conversation

        if (accountCustomer) {
          await tx.conversationCustomer.createMany({
            data: [{ conversationId: conversation.id, accountCustomerId: accountCustomer.id }],
            skipDuplicates: true,
          })
        }

        await tx.conversation.updateMany({
          where: { id: conversation.id, status: "closed" },
          data: { status: "pending" },
        })
      })

      if (!realtimeConversation) return

      if (isNewConversation) {
        this.socketGateway.broadcast(EVENTS.CONVERSATION_CREATED, realtimeConversation)
        return
      }

      const message = realtimeConversation.messages?.at(0)
      if (!message) return
      this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, message)
    } catch (error) {
      this.logger.error(
        `[MessageProcessor][process] ${error instanceof Error ? error.message : String(error)} - ${JSON.stringify(job.data)}`
      )
      throw error
    }
  }

  private async resolveGroupConversationInfo(
    provider: MessagePlatform["provider"],
    externalConversationId: string,
    linkedAccount: LinkAccount
  ) {
    const resolver = this.groupConversationInfoResolvers[provider]
    if (!resolver) throw new Error(`Chưa hỗ trợ conversation group cho channel ${provider}`)
    return resolver(externalConversationId, linkedAccount)
  }

  private async resolveZaloGroup(externalConversationId: string, linkedAccount: LinkAccount) {
    const linkedAccountExternalId = linkedAccount.accountId
    if (!linkedAccountExternalId) throw new Error("Không tìm thấy accountId của tài khoản Zalo")

    const api = this.zaloInstanceRegistry.get(linkedAccountExternalId)
    if (!api) throw new Error("Phiên Zalo cá nhân chưa sẵn sàng để lấy thông tin nhóm")

    const response = await api.getGroupInfo(externalConversationId)
    const group =
      response?.gridInfoMap?.[externalConversationId] ?? response?.gridInfoMap?.[String(externalConversationId)]

    return {
      name: group?.name || "Nhóm hội thoại",
      avatarUrl: group?.fullAvt || group?.avt || null,
    }
  }

  @OnWorkerEvent("error")
  onWorkerError(error: Error) {
    this.logger.error(`Queue Redis connection error! ${error.message}`)
  }
}
