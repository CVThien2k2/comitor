import { Injectable, Logger } from "@nestjs/common"
import type { MessageCreatedEvent } from "@workspace/shared"
import type { MessageSender } from "./message-sender.interface"

@Injectable()
export class ZaloPersonalSender implements MessageSender {
  private readonly logger = new Logger(ZaloPersonalSender.name)

  async send(event: MessageCreatedEvent): Promise<void> {
    this.logger.log(`[Zalo Personal] Gửi tin nhắn ${event.messageId} đến cuộc hội thoại ${event.conversationId}`)
    // TODO: Gọi zca-js API để gửi tin nhắn
  }
}
