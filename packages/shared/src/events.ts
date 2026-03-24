import type { LinkAccount, MessageStatus } from "@workspace/database/dist/generated/client"

export { EVENTS, type SocketEvent } from "./socket-events"

export type UserStatusEvent = {
  userId: string
}

export type MessageCreatedEvent = {
  messageId: string
  linkedAccount: LinkAccount
}

export type MessageDeliveryEvent = {
  messageId: string
  status: MessageStatus
}
