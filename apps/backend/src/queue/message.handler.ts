import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { EVENTS } from "@workspace/shared"
import { AccountCustomerService } from "src/core/account-customer/account-customer.service"
import { ConversationService } from "src/core/conversation/conversation.service"
import { MessageService } from "src/core/message/message.service"
import { PrismaService } from "src/database/prisma.service"
import type { Message } from "src/utils/types"
import { SocketGateway } from "src/websocket/socket.gateway"

@Injectable()
export class MessageHandler {
  private readonly logger = new Logger(MessageHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountCustomerService: AccountCustomerService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly socketGateway: SocketGateway
  ) {}

  async handleInbound(message: Message) {
    const {
      provider,
      senderId,
      recipientId,
      conversationId: externalConversationId,
      messageId: externalMessageId,
      isGroupMessage,
    } = message

    // Check tin nhắn đã xử lý chưa
    const existingMessage = await this.prisma.client.message.findFirst({
      where: { externalId: externalMessageId },
    })

    if (existingMessage) {
      this.logger.warn(`Tin nhắn đã được xử lý từ trước: ${externalMessageId}`)
      return existingMessage
    }

    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: recipientId, provider },
    })

    if (!linkedAccount)
      throw new NotFoundException(`Không tìm thấy LinkedAccount: provider=${provider}, accountId=${recipientId}`)
    if (linkedAccount.status === "inactive")
      this.logger.warn(`Tài khoản ${provider}:${linkedAccount.id} đang ở trạng thái inactive`)

    const { message: dbMessage, isNewConversation } = await this.prisma.client.$transaction(async (tx) => {
      const accountCustomer = await this.accountCustomerService.getOrCreate({ accountId: senderId, linkedAccount }, tx)
      return this.messageService.createInbound(
        {
          externalConversationId,
          linkedAccountId: linkedAccount.id,
          accountCustomerId: accountCustomer.id,
          externalId: externalMessageId,
          timestamp: message.timestamp,
          content: message.text,
          attachments: message.attachments,
          isGroupMessage: isGroupMessage ?? false,
        },
        tx
      )
    })
    this.logger.log(`Đã lưu tin nhắn inbound: ${dbMessage.id} (external: ${externalMessageId})`)

    if (isNewConversation) {
      const fullConversation = await this.conversationService.findById(dbMessage.conversationId)
      this.socketGateway.broadcast(EVENTS.CONVERSATION_CREATED, fullConversation)
    } else {
      const fullMessage = await this.messageService.findById(dbMessage.id)
      this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    }
    return dbMessage
  }

  async handleOutbound(message: Message) {
    const { provider, senderId, recipientId, conversationId, messageId: externalMessageId, isGroupMessage } = message

    // Check tin nhắn đã có external id → đã xử lý rồi thì bỏ qua
    const existingMessage = await this.prisma.client.message.findFirst({
      where: { externalId: externalMessageId },
    })

    if (existingMessage) {
      this.logger.warn(`Tin nhắn đã được xử lý từ trước: ${externalMessageId}`)
      return existingMessage
    }

    // Outbound: senderId = linked account, recipientId = customer
    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: senderId, provider },
    })

    if (!linkedAccount)
      throw new NotFoundException(`Không tìm thấy LinkedAccount: provider=${provider}, accountId=${senderId}`)
    if (linkedAccount.status === "inactive") {
      this.logger.warn(`Tài khoản ${provider}:${linkedAccount.id} đang ở trạng thái inactive`)
      return null
    }

    const { message: dbMessage, isNewConversation } = await this.prisma.client.$transaction(async (tx) => {
      const accountCustomer = await this.accountCustomerService.getOrCreate(
        { accountId: recipientId, linkedAccount },
        tx
      )

      const messageExisting = await tx.message.findFirst({
        where: { externalId: externalMessageId },
      })

      if (messageExisting) {
        this.logger.warn(`Tin nhắn đã được xử lý từ trước trong transaction: ${externalMessageId}`)
        return { message: messageExisting, isNewConversation: false }
      }

      return this.messageService.createOutbound(
        {
          externalConversationId: conversationId,
          linkedAccountId: linkedAccount.id,
          accountCustomerId: accountCustomer.id,
          externalId: externalMessageId,
          timestamp: message.timestamp,
          content: message.text,
          attachments: message.attachments,
          isGroupMessage: isGroupMessage ?? false,
        },
        tx
      )
    })

    this.logger.log(`Đã lưu tin nhắn outbound: ${dbMessage.id} (external: ${externalMessageId})`)

    if (isNewConversation) {
      const fullConversation = await this.conversationService.findById(dbMessage.conversationId)
      this.socketGateway.broadcast(EVENTS.CONVERSATION_CREATED, fullConversation)
    } else {
      const fullMessage = await this.messageService.findById(dbMessage.id)
      this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    }

    return dbMessage
  }
}
