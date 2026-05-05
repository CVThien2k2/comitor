import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { MessageService } from "../core/message/message.service"
import { MessageSenderRegistry } from "../platform/message-senders/message-sender.registry"
import type { MessageCreatedEvent } from "../websocket/socket-event-payloads"
import { EVENTS } from "../websocket/socket-events"
import { SocketGateway } from "../websocket/socket.gateway"
import { EMIT_EVENTS } from "./emit-events"

@Injectable()
export class MessageListener {

  constructor(
    private readonly senderRegistry: MessageSenderRegistry,
    private readonly messageService: MessageService,
    private readonly socketGateway: SocketGateway
  ) { }

  @OnEvent(EMIT_EVENTS.MESSAGE_OUTBOUND_CREATED)
  async handleMessageCreated(event: MessageCreatedEvent) {
    const { message, linkedAccount } = event
    const provider = linkedAccount.provider
    const sender = this.senderRegistry.get(provider)
    const realtimeConversation = await this.messageService.findConversationRealtime(message.conversationId)

    if (message.createdBy) {
      this.socketGateway.broadcastExcept([message.createdBy], EVENTS.MESSAGE_CREATE, realtimeConversation)
    } else {
      this.socketGateway.broadcast(EVENTS.MESSAGE_CREATE, realtimeConversation)
    }

    try {
      if (!sender) throw new Error(`Missing sender for provider: ${provider}`)
      const conversationExternalId = realtimeConversation.externalId
      if (!conversationExternalId) throw new Error("Conversation externalId không tồn tại")
      const sendResult = await sender.send({
        message,
        linkedAccount,
        conversationExternalId,
        conversationType: realtimeConversation.type,
      })
      await this.messageService.updateStatus(message.id, {
        status: "success",
        externalId: sendResult?.externalMessageId,
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
