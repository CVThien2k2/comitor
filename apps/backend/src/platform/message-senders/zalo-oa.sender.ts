import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput, MessageSenderResponse } from "./message-sender.interface"
import { ZaloOaService } from "src/api/zalo_oa.service"
import { PrismaService } from "src/database/prisma.service"

@Injectable()
export class ZaloOaSender implements MessageSender {
  private readonly logger = new Logger(ZaloOaSender.name)

  constructor(
    private readonly zaloOaService: ZaloOaService,
    private readonly prisma: PrismaService
  ) {}

  async send(input: MessageSenderInput): Promise<any> {
    this.logger.log(`[Zalo OA] Gửi tin nhắn ${input.message.id} đến cuộc hội thoại ${input.message.conversationId}`)
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: input.message.conversationId },
      select: { accountCustomer: true, linkedAccount: true },
    })

    const response = (await this.zaloOaService.sendMessage({
      provider: "zalo_oa",
      senderId: conversation?.linkedAccount?.accountId || "",
      recipientId: conversation?.accountCustomer?.accountId || "",
      conversationId: input.message.conversationId,
      text: input.message.content || "",
      attachments: input.message.attachments?.map((a) => a.key).filter(Boolean) as string[],
    })) as MessageSenderResponse

    return response
  }
}
