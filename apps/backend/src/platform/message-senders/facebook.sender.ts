import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class FacebookSender implements MessageSender {
  private readonly logger = new Logger(FacebookSender.name)

  async send(input: MessageSenderInput): Promise<void> {
    this.logger.log(`[Facebook] Gửi tin nhắn ${input.message.id} đến cuộc hội thoại ${input.message.conversationId}`)
  }
}
