import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EVENTS, type MessageCreatedEvent, type MessageDeliveryEvent } from "@workspace/shared"
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
      const errorMessage = error instanceof Error ? error.message : "Gửi tin nhắn thất bại"
      this.logger.error(`Error sending message ${fullMessage.id}: ${errorMessage}`)
      await this.messageService.updateStatus(fullMessage.id, { status: "failed" })

      const payload: MessageDeliveryEvent = {
        messageId: fullMessage.id,
        conversationId: fullMessage.conversationId,
        status: "failed",
      }

      if (fullMessage.userId) {
        this.socketGateway.sendToUser([fullMessage.userId], EVENTS.MESSAGE_DELIVERY_FAILED, {
          ...payload,
          errorMessage,
        })
        this.socketGateway.broadcastExcept([fullMessage.userId], EVENTS.MESSAGE_DELIVERY_FAILED, payload)
        return
      }

      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
        ...payload,
        errorMessage,
      })
    }
  }
}
