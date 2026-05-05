import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class FacebookSender implements MessageSender {
  private readonly logger = new Logger(FacebookSender.name)

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
          `[Facebook] send type=${input.message.type} message=${input.message.id} conversation=${input.message.conversationId}`
        )
        return
      default:
        throw new Error(`Unsupported Facebook message type: ${input.message.type}`)
    }
  }
}
