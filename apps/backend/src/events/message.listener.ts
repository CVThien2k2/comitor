import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EVENTS, type MessageCreatedEvent } from "@workspace/shared"
import { MessageSenderRegistry } from "../platform/message-senders/message-sender.registry"
import { MessageService } from "../core/message/message.service"
import { SocketGateway } from "../websocket/socket.gateway"

@Injectable()
export class MessageListener {
  private readonly logger = new Logger(MessageListener.name)

  constructor(
    private readonly senderRegistry: MessageSenderRegistry,
    private readonly messageService: MessageService,
    private readonly socketGateway: SocketGateway
  ) {}

  @OnEvent(EVENTS.MESSAGE_CREATED)
  async handleMessageCreated(event: MessageCreatedEvent) {
    const { messageId, linkedAccount } = event

    if (!linkedAccount || !messageId) {
      this.logger.warn("Tài khoản liên kết hoặc tin nhắn không tồn tại")
      return
    }
    const fullMessage = await this.messageService.findById(messageId)

    this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    const sender = this.senderRegistry.get(linkedAccount.provider)
    if (!sender) {
      this.logger.warn(`Không tìm thấy sender cho provider: ${linkedAccount.provider}`)
      return
    }

    try {
      await sender.send({ message: fullMessage, linkedAccount })
      await this.messageService.updateStatus(event.messageId, "success")

      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, {
        messageId: event.messageId,
        status: "success",
      })
    } catch (error) {
      await this.messageService.updateStatus(event.messageId, "failed")
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
        messageId: event.messageId,
        status: "failed",
      })
    }
  }
}
