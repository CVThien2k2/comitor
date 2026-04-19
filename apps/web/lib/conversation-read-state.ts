import type { Conversation, MessageItem } from "@/lib/types"

export type ConversationReadOverride = {
  messageId: string
  isRead: boolean
}

export type ConversationReadOverrideMap = Record<string, ConversationReadOverride>

export function getConversationLatestMessage(conversation: Conversation | null | undefined): MessageItem | null {
  return conversation?.messages?.[0] ?? null
}

export function getUnreadCountFromLatestMessage(messages: MessageItem[] | undefined, fallbackUnreadCount = 0) {
  const latestMessage = messages?.[0]
  if (latestMessage) return latestMessage.isRead ? 0 : 1
  return fallbackUnreadCount > 0 ? 1 : 0
}

export function getCurrentConversationUnreadCount(
  listConversation: Conversation | null | undefined,
  selectedConversation: Conversation | null | undefined
) {
  const latestMessage = getConversationLatestMessage(selectedConversation) ?? getConversationLatestMessage(listConversation)
  if (latestMessage) return latestMessage.isRead ? 0 : 1

  return Math.max(listConversation?.unreadCount ?? 0, selectedConversation?.unreadCount ?? 0) > 0 ? 1 : 0
}

export function applyConversationReadOverride(
  conversation: Conversation,
  conversationReadOverrides: ConversationReadOverrideMap
): Conversation {
  const override = conversationReadOverrides[conversation.id]
  if (!override) return conversation

  const latestMessage = conversation.messages?.[0]
  if (latestMessage && latestMessage.id !== override.messageId) {
    return conversation
  }

  const messages =
    latestMessage && conversation.messages
      ? conversation.messages.map((message, index) => (index === 0 ? { ...message, isRead: override.isRead } : message))
      : conversation.messages

  return {
    ...conversation,
    messages,
    unreadCount: override.isRead ? 0 : 1,
  }
}

export function patchConversationMessageReadState(
  conversation: Conversation | null | undefined,
  messageId: string,
  nextIsRead: boolean,
  fallbackUnreadCount?: number
) {
  if (!conversation) return conversation ?? null

  let didUpdate = false
  const messages = conversation.messages?.map((message) => {
    if (message.id !== messageId) return message
    didUpdate = true
    return { ...message, isRead: nextIsRead }
  })

  if (!didUpdate) {
    return {
      ...conversation,
      unreadCount: fallbackUnreadCount ?? conversation.unreadCount ?? 0,
    }
  }

  return {
    ...conversation,
    messages,
    unreadCount: getUnreadCountFromLatestMessage(messages, conversation.unreadCount ?? 0),
  }
}

export function patchConversationLatestMessageReadState(
  conversation: Conversation,
  messageId: string,
  nextIsRead: boolean
): Conversation {
  const latestMessage = conversation.messages?.[0]
  if (latestMessage && latestMessage.id !== messageId) return conversation

  const messages =
    latestMessage && conversation.messages
      ? conversation.messages.map((message, index) => (index === 0 ? { ...message, isRead: nextIsRead } : message))
      : conversation.messages

  return {
    ...conversation,
    messages,
    unreadCount: nextIsRead ? 0 : 1,
  }
}
