import type { LinkAccount, MessageAttachment, Message } from "@workspace/database"

export type MessageSenderInput = {
  message: Message & { attachments?: MessageAttachment[] }
  linkedAccount: LinkAccount
}

export interface MessageSenderResponse {
  messageId: string
  conversationId: string
  userId: string
}

export interface MessageSender {
  send(input: MessageSenderInput)
}

export const MESSAGE_SENDER = Symbol("MESSAGE_SENDER")
