import { EVENTS } from "@/lib/socket-events"
import type { ConversationItem } from "@/lib/types"
import { useAppStore } from "@/stores/app-store"
import { useChatStore } from "@/stores/chat-store"
import type { Socket } from "socket.io-client"

export function handleConversationEvents(socket: Socket) {
  try {
    socket.on(EVENTS.CONVERSATION_CREATED, (conversation: ConversationItem) => {
      // Realtime tạo hội thoại mới: đẩy vào store list và tự sort theo lastActivityAt.
      const chatState = useChatStore.getState()
      const existed = chatState.conversations.some((item) => item.id === conversation.id)
      chatState.appendConversations([conversation])

      // Chỉ tăng badge khi đây là hội thoại mới và đang có unread.
      if (!existed && (conversation.isUnread || (conversation.countUnreadMessages ?? 0) > 0)) {
        useAppStore.getState().incrementConversationsUnreadCount(1)
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling conversation events:", message)
  }
}
