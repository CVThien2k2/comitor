import { Injectable, Logger } from "@nestjs/common"
import { AccountCustomerService } from "src/core/account-customer/account-customer.service"
import { ConversationService } from "src/core/conversation/conversation.service"
import { MessageService } from "src/core/message/message.service"
import { PrismaService } from "src/database/prisma.service"
import type { MessagePlatform } from "src/utils/types"
import { SocketGateway } from "src/websocket/socket.gateway"
import { ZaloInstanceRegistry } from "src/platform/zalo/zalo-instance.registry"

@Injectable()
export class MessageHandler {
  private readonly logger = new Logger(MessageHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountCustomerService: AccountCustomerService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly socketGateway: SocketGateway,
    private readonly zaloInstanceRegistry: ZaloInstanceRegistry
  ) {}

  async handleInbound(message: MessagePlatform) {
    const {
      provider,
      senderId,
      recipientId,
      messageId: externalMessageId,
      isGroupMessage,
      content,
      timestamp,
      type,
    } = message

    const existingMessage = await this.prisma.client.message.findFirst({
      where: { externalId: externalMessageId },
    })
    if (existingMessage) return

    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: recipientId, provider, status: "active", isDeleted: false },
    })
    if (!linkedAccount) return

    // const { message: dbMessage, isNewConversation } =
    await this.prisma.client.$transaction(async (tx) => {
      const accountCustomer = await this.accountCustomerService.getOrCreate({ accountId: senderId, linkedAccount }, tx)
      if (!accountCustomer) throw new Error("Không tìm thấy tài khoản khách hàng")
      // return this.messageService.createInbound(
      //   {
      //     externalConversationId,
      //     linkedAccountId: linkedAccount.id,
      //     accountCustomerId: accountCustomer.id,
      //     externalId: externalMessageId,
      //     timestamp: message.timestamp,
      //     content: message.text,
      //     attachments: message.attachments,
      //     isGroupMessage: isGroupMessage ?? false,
      //   },
      //   tx
      // )
    })
    // this.logger.log(`Đã lưu tin nhắn inbound: ${dbMessage.id} (external: ${externalMessageId})`)
    // if (isNewConversation) {
    //   const fullConversation = await this.conversationService.findById(dbMessage.conversationId)
    //   this.socketGateway.broadcast(EVENTS.CONVERSATION_CREATED, fullConversation)
    // } else {
    //   const fullMessage = await this.messageService.findById(dbMessage.id)
    //   this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    // }
    // return dbMessage
  }

  async handleOutbound(message: MessagePlatform) {
    const {
      provider,
      senderId,
      recipientId,
      messageId: externalMessageId,
      isGroupMessage,
      content,
      timestamp,
      type,
    } = message
    // Check tin nhắn đã có external id → đã xử lý rồi thì bỏ qua
    const existingMessage = await this.prisma.client.message.findFirst({
      where: { externalId: externalMessageId },
    })
    if (existingMessage) return

    // Outbound: senderId = linked account, recipientId = customer
    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: senderId, provider, status: "active", isDeleted: false },
    })
    if (!linkedAccount) return
    // const { message: dbMessage, isNewConversation } =
    await this.prisma.client.$transaction(async (tx) => {
      const accountCustomer = await this.accountCustomerService.getOrCreate(
        { accountId: recipientId, linkedAccount },
        tx
      )
      // const messageExisting = await tx.message.findFirst({
      //   where: { externalId: externalMessageId },
      // })
      // if (messageExisting) return { message: messageExisting, isNewConversation: false }

      // return this.messageService.createOutbound(
      //   {
      //     externalConversationId: conversationId,
      //     linkedAccountId: linkedAccount.id,
      //     accountCustomerId: accountCustomer.id,
      //     externalId: externalMessageId,
      //     timestamp: message.timestamp,
      //     content: message.text,
      //     attachments: message.attachments,
      //     isGroupMessage: isGroupMessage ?? false,
      //   },
      //   tx
      // )
    })
    // this.logger.log(`Đã lưu tin nhắn outbound: ${dbMessage.id} (external: ${externalMessageId})`)
    // if (isNewConversation) {
    //   const fullConversation = await this.conversationService.findById(dbMessage.conversationId)
    //   this.socketGateway.broadcast(EVENTS.CONVERSATION_CREATED, fullConversation)
    // } else {
    //   const fullMessage = await this.messageService.findById(dbMessage.id)
    //   this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    // }
    // return dbMessage
  }
}
