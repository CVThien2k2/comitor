import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/database/prisma.service"
import { AccountCustomerService } from "src/core/account-customer/account-customer.service"
import { MessageService } from "src/core/message/message.service"
import type { Message } from "src/utils/types"

@Injectable()
export class IncomingMessageHandler {
  private readonly logger = new Logger(IncomingMessageHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountCustomerService: AccountCustomerService,
    private readonly messageService: MessageService
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

    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: recipientId, provider },
    })

    if (!linkedAccount)
      throw new NotFoundException(`Không tìm thấy LinkedAccount: provider=${provider}, accountId=${recipientId}`)

    const dbMessage = await this.prisma.client.$transaction(async (tx) => {
      const accountCustomer = await this.accountCustomerService.getOrCreate({ accountId: senderId, linkedAccount }, tx)

      return this.messageService.createInbound(
        {
          externalConversationId,
          linkedAccountId: linkedAccount.id,
          accountCustomerId: accountCustomer.id,
          externalId: externalMessageId,
          content: message.text,
          attachments: message.attachments,
          isGroupMessage: isGroupMessage ?? false,
        },
        tx
      )
    })

    return dbMessage
  }
}
