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
    (conversationId: string) => {
      if (markingConversationIds.has(conversationId)) return
      markingConversationIds.add(conversationId)

      const wasUnread = markConversationAsRead(conversationId)
      if (wasUnread) {
        decrementUnreadConversationsCount(1)
      }

      void conversationsApi
        .markAsRead(conversationId)
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            markingConversationIds.delete(conversationId)
          }, 800)
        })
    },
    [decrementUnreadConversationsCount, markConversationAsRead]
  )

  return { markAsRead }
}
