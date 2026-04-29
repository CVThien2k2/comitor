import { create } from "zustand"
import type { ConversationItem } from "@/lib/types"

type ChatState = {
  conversations: ConversationItem[]
}

type ChatActions = {
  setConversations: (conversations: ConversationItem[]) => void // Danh sách cuộc hội thoại
  appendConversations: (incoming: ConversationItem[]) => void // Thêm cuộc hội thoại mới vào danh sách
  markConversationAsRead: (conversationId: string) => boolean // Trả về true nếu cuộc hội thoại trước đó là unread, false nếu không
}

function sortByLastActivity(conversations: ConversationItem[]) {
  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastActivityAt).getTime()
    const timeB = new Date(b.lastActivityAt).getTime()
    if (timeA !== timeB) return timeB - timeA
    return a.id.localeCompare(b.id)
  })
}

export const useChatStore = create<ChatState & ChatActions>()((set) => ({
  conversations: [],

  setConversations: (conversations) => set({ conversations: sortByLastActivity(conversations) }),

  appendConversations: (incoming) =>
    set((state) => {
      const conversations = (() => {
        const byId = new Map(state.conversations.map((conversation) => [conversation.id, conversation] as const))
        for (const conversation of incoming) {
          byId.set(conversation.id, conversation)
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
}))
