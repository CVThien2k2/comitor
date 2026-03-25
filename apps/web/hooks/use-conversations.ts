import { useCallback } from "react"
import { useChatStore } from "@/stores/chat-store"
import { useAppStore } from "@/stores/app-store"
import { conversations as conversationsApi } from "@/api/conversations"

export function useConversations() {
  const markAsRead = useCallback((conversationId: string) => {
    const { wasUnread, hasUnreadInState } = useChatStore.getState().markAsRead(conversationId)

    // Server cần đồng bộ nếu trước đó hoặc hiện tại state còn unread thật sự.
    if (wasUnread || hasUnreadInState) {
      // Patch local state trước để UI phản hồi ngay; gọi API server để đồng bộ trạng thái.
      void conversationsApi.markAsRead(conversationId).catch(() => {
        // Không block UI nếu call API thất bại.
      })
    }

    if (wasUnread) useAppStore.getState().decrementConversationsUnreadCount(1)
  }, [])

  return { markAsRead }
}
