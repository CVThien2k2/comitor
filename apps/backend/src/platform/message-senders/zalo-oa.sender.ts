import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class ZaloOaSender implements MessageSender {
  private readonly logger = new Logger(ZaloOaSender.name)

  constructor() {}

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
          `[Zalo OA] send type=${input.message.type} message=${input.message.id} conversation=${input.message.conversationId}`
        )
        return
      default:
        throw new Error(`Unsupported Zalo OA message type: ${input.message.type}`)
    }
  }
}
