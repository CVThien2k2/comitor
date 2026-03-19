import { LinkAccount, Message, MessageAttachment, MessageStatus } from "@workspace/database/dist/generated/client"

/** Socket events (emitted to clients via Socket.IO) */
export const EVENTS = {
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  MESSAGE_CREATED: "message-created",
  MESSAGE_DELIVERY_SUCCEEDED: "message-delivery-succeeded",
  MESSAGE_DELIVERY_FAILED: "message-delivery-failed",
} as const

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

export type SocketEvent = (typeof EVENTS)[keyof typeof EVENTS]
