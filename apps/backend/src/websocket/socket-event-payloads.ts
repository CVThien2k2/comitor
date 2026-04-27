import type { LinkAccount, Message, MessageStatus } from "@workspace/database/generated/client"

export type UserStatusEvent = {
  userId: string
}

export type MessageCreatedEvent = {
  message: Message
  linkedAccount: LinkAccount
}

export type MessageDeliveryEvent = {
  messageId: string
  conversationId: string
  status: MessageStatus
  errorMessage?: string
}
