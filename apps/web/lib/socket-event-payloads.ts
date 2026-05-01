import type { MessageStatus } from "@workspace/database"

export type MessageDeliveryEvent = {
  messageId: string
  conversationId: string
  status: MessageStatus
  errorMessage?: string
}

export type UserStatusEvent = {
  userId: string
  timestamp: string
}
