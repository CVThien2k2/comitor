import { Injectable, Logger } from "@nestjs/common"
import type { MessageCreatedEvent } from "@workspace/shared"
import type { MessageSender } from "./message-sender.interface"

@Injectable()
export class FacebookSender implements MessageSender {
  private readonly logger = new Logger(FacebookSender.name)

  async send(event: MessageCreatedEvent): Promise<void> {
    this.logger.log(`[Facebook] Gửi tin nhắn ${event.messageId} đến cuộc hội thoại ${event.conversationId}`)
  }
}
