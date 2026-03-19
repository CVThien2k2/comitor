import type { LinkAccount, MessageAttachment, Message } from "@workspace/database"

export type MessageSenderInput = {
  message: Message & { attachments?: MessageAttachment[] }
  linkedAccount: LinkAccount
}
export interface MessageSender {
  send(input: MessageSenderInput): Promise<void>
}

export const MESSAGE_SENDER = Symbol("MESSAGE_SENDER")
