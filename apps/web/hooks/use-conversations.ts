import { useCallback } from "react"
import { conversations as conversationsApi } from "@/api/conversations"
import { useAppStore } from "@/stores/app-store"
import { useChatStore } from "@/stores/chat-store"

// Chặn gọi mark-read trùng khi component mount lại nhanh (Strict Mode/dev).
const markingConversationIds = new Set<string>()

export function useConversations() {
  const markConversationAsRead = useChatStore((s) => s.markConversationAsRead)
  const decrementUnreadConversationsCount = useAppStore((s) => s.decrementConversationsUnreadCount)

  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (markingConversationIds.has(conversationId)) return
      markingConversationIds.add(conversationId)

      const wasUnread = markConversationAsRead(conversationId)
      if (wasUnread) {
        decrementUnreadConversationsCount(1)
        try {
          await conversationsApi.markRead(conversationId)
        } catch (error) {
          console.error("Failed to mark conversation as read:", error)
        }
      }

      markingConversationIds.delete(conversationId)
    },
    [decrementUnreadConversationsCount, markConversationAsRead]
  )

  return { markAsRead }
}
