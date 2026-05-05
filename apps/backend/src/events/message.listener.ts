import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { MessageService } from "../core/message/message.service"
// import { MessageSenderRegistry } from "../platform/message-senders/message-sender.registry"
import type { MessageCreatedEvent } from "../websocket/socket-event-payloads"
import { EVENTS } from "../websocket/socket-events"
import { SocketGateway } from "../websocket/socket.gateway"
import { EMIT_EVENTS } from "./emit-events"

@Injectable()
export class MessageListener {
  private readonly logger = new Logger(MessageListener.name)

  constructor(
    // private readonly senderRegistry: MessageSenderRegistry,
    private readonly messageService: MessageService,
    private readonly socketGateway: SocketGateway
  ) {}

  @OnEvent(EMIT_EVENTS.MESSAGE_OUTBOUND_CREATED)
  async handleMessageCreated(event: MessageCreatedEvent) {
    const { message, linkedAccount } = event
    // const provider = linkedAccount.provider
    // const sender = this.senderRegistry.get(provider)

    // if (!sender) {
    //   await this.messageService.updateStatus(message.id, { status: "failed" })
    //   this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
    //     messageId: message.id,
    //     conversationId: message.conversationId,
    //     status: "failed",
    //     errorMessage: `Chưa hỗ trợ gửi outbound cho provider: ${provider}`,
    //   })
    //   this.logger.warn(`Missing sender for provider ${provider}, message=${message.id}`)
    //   return
    // }

    // const createdMessage = await this.messageService.findById(message.id)
    // this.socketGateway.broadcast(EVENTS.MESSAGE_CREATED, createdMessage)

    try {
      // const sendResult = await sender.send({ message, linkedAccount })
      await this.messageService.updateStatus(message.id, {
        status: "success",
        // externalId: sendResult?.externalMessageId,
      })
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, {
        messageId: message.id,
        conversationId: message.conversationId,
        status: "success",
      })
    } catch (error) {
      await this.messageService.updateStatus(message.id, { status: "failed" })
      this.socketGateway.broadcast(EVENTS.MESSAGE_DELIVERY_FAILED, {
        messageId: message.id,
        conversationId: message.conversationId,
        status: "failed",
      })
    }
  }
}
