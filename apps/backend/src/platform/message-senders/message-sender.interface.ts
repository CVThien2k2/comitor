import type { ConversationType, LinkAccount, Message } from "@workspace/database"

export type MessageSenderInput = {
  message: Message
  linkedAccount: LinkAccount
  conversationExternalId: string
  conversationType: ConversationType
}

export interface MessageSenderResponse {
  externalMessageId?: string
}

export interface MessageSender {
  send(input: MessageSenderInput): Promise<MessageSenderResponse | void>
}

export const MESSAGE_SENDER = Symbol("MESSAGE_SENDER")
