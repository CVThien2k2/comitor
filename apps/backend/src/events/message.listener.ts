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
    const { message: fullMessage, linkedAccount } = event

    if (!linkedAccount || !fullMessage) {
      this.logger.warn("Tài khoản liên kết hoặc tin nhắn không tồn tại")
      return
    }
    if (linkedAccount.status === "inactive") {
      this.logger.warn(`Tài khoản ${linkedAccount.provider}:${linkedAccount.id} đang ở trạng thái inactive`)
      return
    }
    if (fullMessage.userId) {
      this.socketGateway.broadcastExcept([fullMessage.userId], EVENTS.MESSAGE_CREATED, fullMessage)
    } else {
      this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, fullMessage)
    }
    const sender = this.senderRegistry.get(linkedAccount.provider)
    if (!sender) {
      this.logger.warn(`Không tìm thấy sender cho provider: ${linkedAccount.provider}`)
      return
    }

    try {
      const response = await sender.send({ message: fullMessage, linkedAccount })
      await this.messageService.updateStatus(fullMessage.id, {
        status: "success",
        externalId: Array.isArray(response) ? response.at(0)?.messageId : response?.messageId,
      })
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, {
        messageId: fullMessage.id,
        conversationId: fullMessage.conversationId,
        status: "success",
      })
    } catch (error) {
      this.logger.error(`Error sending message ${fullMessage.id}: ${error}`)
      await this.messageService.updateStatus(fullMessage.id, { status: "failed" })
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
        messageId: fullMessage.id,
        conversationId: fullMessage.conversationId,
        status: "failed",
      })
    }
  }
}
