import { Injectable, Logger } from "@nestjs/common"
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
    this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, {
      ...event,
      timestamp: new Date().toISOString(),
    })

    const sender = this.senderRegistry.get(event.provider)
    if (!sender) {
      this.logger.warn(`Không tìm thấy sender cho provider: ${event.provider}`)
      return
    }

    try {
      await sender.send(event)
      await this.messageService.updateStatus(event.messageId, "success")
      this.logger.log(`Gửi tin nhắn thành công [${event.provider}]: ${event.messageId}`)

      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, {
        messageId: event.messageId,
        conversationId: event.conversationId,
        provider: event.provider,
        status: "success",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      await this.messageService.updateStatus(event.messageId, "failed")
      this.logger.error(`Gửi tin nhắn thất bại [${event.provider}]: ${error}`)

      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
        messageId: event.messageId,
        conversationId: event.conversationId,
        provider: event.provider,
        status: "failed",
        timestamp: new Date().toISOString(),
      })
    }
  }
}
