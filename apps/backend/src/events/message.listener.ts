import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EVENTS, type MessageCreatedEvent } from "@workspace/shared"
import { MessageService } from "../core/message/message.service"
import { MessageSenderRegistry } from "../platform/message-senders/message-sender.registry"
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
    if (linkedAccount.status === "inactive") {
      this.logger.warn(`Tài khoản ${linkedAccount.provider}:${linkedAccount.id} đang ở trạng thái inactive`)
      return
    }
    const fullMessage = await this.messageService.findById(messageId as string)

    this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    const sender = this.senderRegistry.get(linkedAccount.provider)
    if (!sender) {
      this.logger.warn(`Không tìm thấy sender cho provider: ${linkedAccount.provider}`)
      return
    }

    try {
      const response = await sender.send({ message: fullMessage, linkedAccount })
      await this.messageService.updateStatus(event.messageId, {
        status: "success",
        externalId: Array.isArray(response) ? response.at(0)?.messageId : response?.messageId,
      })
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, {
        messageId: fullMessage.id,
        conversationId: fullMessage.conversationId,
        status: "success",
      })
    } catch (error) {
      this.logger.error(`Error sending message ${event.messageId}: ${error}`)
      await this.messageService.updateStatus(event.messageId, { status: "failed" })
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
        messageId: fullMessage.id,
        conversationId: fullMessage.conversationId,
        status: "failed",
      })
    }
  }
}
