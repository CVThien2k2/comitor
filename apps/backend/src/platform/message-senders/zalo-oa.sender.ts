import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class ZaloOaSender implements MessageSender {
  private readonly logger = new Logger(ZaloOaSender.name)

  async send(input: MessageSenderInput): Promise<void> {
    this.logger.log(`[Zalo OA] Gửi tin nhắn ${input.message.id} đến cuộc hội thoại ${input.message.conversationId}`)
    // TODO: Gọi Zalo OA API để gửi tin nhắn
  }
}
