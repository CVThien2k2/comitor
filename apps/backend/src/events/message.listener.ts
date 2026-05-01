import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { MessageService } from "../core/message/message.service"
import { MessageSenderRegistry } from "../platform/message-senders/message-sender.registry"
import type { MessageCreatedEvent } from "../websocket/socket-event-payloads"
import { SocketGateway } from "../websocket/socket.gateway"
import { EMIT_EVENTS } from "./emit-events"

@Injectable()
export class MessageListener {
  private readonly logger = new Logger(MessageListener.name)

  constructor(
    private readonly senderRegistry: MessageSenderRegistry,
    private readonly messageService: MessageService,
    private readonly socketGateway: SocketGateway
  ) {}

  @OnEvent(EMIT_EVENTS.MESSAGE_OUTBOUND_CREATED)
  async handleMessageCreated(event: MessageCreatedEvent) {
    console.log("MESSAGE_CREATED", event)
  }
}
