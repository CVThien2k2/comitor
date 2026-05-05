import { Injectable, Logger } from "@nestjs/common"
import { ConversationService } from "src/core/conversation/conversation.service"
import { PrismaService } from "src/database/prisma.service"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class ZaloPersonalSender implements MessageSender {
  private readonly logger = new Logger(ZaloPersonalSender.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService
  ) {}

  async send(input: MessageSenderInput) {
    switch (input.message.type) {
      case "text":
      case "image":
      case "video":
      case "audio":
      case "file":
      case "sticker":
      case "gif":
      case "recommended":
      case "location":
      case "template":
        this.logger.log(
          `[Zalo Personal] send type=${input.message.type} message=${input.message.id} conversation=${input.message.conversationId}`
        )
        return
      default:
        throw new Error(`Unsupported Zalo Personal message type: ${input.message.type}`)
    }
  }
}
