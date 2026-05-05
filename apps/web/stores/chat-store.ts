import { create } from "zustand"
import type { ConversationItem, MessageItem } from "@/lib/types"
import type { MessageStatus } from "@workspace/database"

type ChatState = {
  conversations: ConversationItem[]
  bufferedMessageStatuses: Record<string, MessageStatus>
}

type ChatActions = {
  setConversations: (conversations: ConversationItem[]) => void // Danh sách cuộc hội thoại
  appendConversations: (incoming: ConversationItem[]) => void // Thêm cuộc hội thoại mới vào danh sách
  markConversationAsRead: (conversationId: string) => boolean // Trả về true nếu cuộc hội thoại trước đó là unread, false nếu không
  appendPendingMessage: (conversationId: string, message: MessageItem) => void
  replacePendingMessageId: (conversationId: string, tempId: string, persistedMessage: MessageItem) => void
  updateMessageStatus: (conversationId: string, messageId: string, status: MessageStatus) => void
}

function sortByLastActivity(conversations: ConversationItem[]) {
  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastActivityAt).getTime()
    const timeB = new Date(b.lastActivityAt).getTime()
    if (timeA !== timeB) return timeB - timeA
    return a.id.localeCompare(b.id)
  })
}

function sortMessagesDesc(messages: MessageItem[]) {
  return [...messages].sort((a, b) => {
    const ta = new Date(a.timestamp || a.createdAt).getTime()
    const tb = new Date(b.timestamp || b.createdAt).getTime()
    if (ta !== tb) return tb - ta
    return b.id.localeCompare(a.id)
  })
}

export const useChatStore = create<ChatState & ChatActions>()((set) => ({
  conversations: [],
  bufferedMessageStatuses: {},

  setConversations: (conversations) => set({ conversations: sortByLastActivity(conversations) }),

  appendConversations: (incoming) =>
    set((state) => {
      const conversations = (() => {
        const byId = new Map(state.conversations.map((conversation) => [conversation.id, conversation] as const))

        for (const incomingConversation of incoming) {
          const existingConversation = byId.get(incomingConversation.id)
          if (!existingConversation) {
            byId.set(incomingConversation.id, incomingConversation)
            continue
          }

          const messageById = new Map<string, MessageItem>()
          for (const message of existingConversation.messages ?? []) messageById.set(message.id, message)
          for (const message of incomingConversation.messages ?? []) messageById.set(message.id, message)

          byId.set(incomingConversation.id, {
            ...existingConversation,
            ...incomingConversation,
            messages: sortMessagesDesc([...messageById.values()]),
          })
        }

        return sortByLastActivity([...byId.values()])
      })()
      return { conversations }
    }),

  markConversationAsRead: (conversationId) => {
    let wasUnread = false

    set((state) => {
      const conversations = state.conversations.map((conversation) => {
        if (conversation.id !== conversationId) return conversation

        wasUnread = conversation.isUnread || (conversation.countUnreadMessages ?? 0) > 0
        if (!wasUnread) return conversation

        return {
          ...conversation,
          isUnread: false,
          countUnreadMessages: 0,
          unreadCount: 0,
          lastViewedAt: new Date().toISOString(),
        }
      })

      return { conversations }
    })

    return wasUnread
  },

  appendPendingMessage: (conversationId, message) =>
    set((state) => {
      const conversations = sortByLastActivity(
        state.conversations.map((conversation) => {
          if (conversation.id !== conversationId) return conversation

          return {
            ...conversation,
            messages: [message, ...conversation.messages],
            lastActivityAt: message.timestamp || new Date().toISOString(),
          }
        })
      )
      return { conversations }
    }),

  replacePendingMessageId: (conversationId, tempId, persistedMessage) =>
    set((state) => {
      const bufferedStatus = state.bufferedMessageStatuses[persistedMessage.id]
      const nextBufferedStatuses = { ...state.bufferedMessageStatuses }
      if (bufferedStatus) delete nextBufferedStatuses[persistedMessage.id]

      const conversations = sortByLastActivity(
        state.conversations.map((conversation) => {
          if (conversation.id !== conversationId) return conversation

          const tempMessage = conversation.messages.find((message) => message.id === tempId)
          const mergedStatus =
            bufferedStatus ?? (tempMessage && tempMessage.status !== "processing" ? tempMessage.status : persistedMessage.status)

          const withoutTemp = conversation.messages.filter((message) => message.id !== tempId)
          const persistedIndex = withoutTemp.findIndex((message) => message.id === persistedMessage.id)
          const nextMessages =
            persistedIndex >= 0
              ? withoutTemp.map((message, index) =>
                  index === persistedIndex ? { ...persistedMessage, status: mergedStatus } : message
                )
              : [{ ...persistedMessage, status: mergedStatus }, ...withoutTemp]

          return {
            ...conversation,
            messages: nextMessages,
            lastActivityAt: persistedMessage.timestamp || persistedMessage.createdAt || new Date().toISOString(),
          }
        })
      )
      return { conversations, bufferedMessageStatuses: nextBufferedStatuses }
    }),

  updateMessageStatus: (conversationId, messageId, status) =>
    set((state) => {
      let found = false
      const conversations = state.conversations.map((conversation) => {
        if (conversation.id !== conversationId) return conversation

        return {
          ...conversation,
          messages: conversation.messages.map((message) => {
            if (message.id !== messageId) return message
            found = true
            return { ...message, status }
          }),
        }
      })

      if (found) return { conversations }

      return {
        conversations,
        bufferedMessageStatuses: {
          ...state.bufferedMessageStatuses,
          [messageId]: status,
        },
      }
    }),
}))
