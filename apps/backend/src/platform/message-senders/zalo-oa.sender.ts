import { Injectable, Logger } from "@nestjs/common"
import type { MessageCreatedEvent } from "@workspace/shared"
import type { MessageSender } from "./message-sender.interface"

@Injectable()
export class ZaloOaSender implements MessageSender {
  private readonly logger = new Logger(ZaloOaSender.name)

  async send(event: MessageCreatedEvent): Promise<void> {
    this.logger.log(`[Zalo OA] Gửi tin nhắn ${event.messageId} đến cuộc hội thoại ${event.conversationId}`)
    // TODO: Gọi Zalo OA API để gửi tin nhắn
  }
}
