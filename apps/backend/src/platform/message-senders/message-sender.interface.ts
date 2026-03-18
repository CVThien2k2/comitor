import type { MessageCreatedEvent } from "@workspace/shared"

export interface MessageSender {
  send(event: MessageCreatedEvent): Promise<void>
}

export const MESSAGE_SENDER = Symbol("MESSAGE_SENDER")
