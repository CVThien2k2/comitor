import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class ZaloPersonalSender implements MessageSender {
  private readonly logger = new Logger(ZaloPersonalSender.name)

  async send(input: MessageSenderInput): Promise<void> {
    this.logger.log(
      `[Zalo Personal] Gửi tin nhắn ${input.message.id} đến cuộc hội thoại ${input.message.conversationId}`
    )
    // TODO: Gọi zca-js API để gửi tin nhắn
  }
}
