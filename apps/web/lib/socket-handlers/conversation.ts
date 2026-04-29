import { EVENTS } from "@/lib/socket-events"
import type { Socket } from "socket.io-client"
import type { ConversationItem } from "@/lib/types"
import { useChatStore } from "@/stores/chat-store"
import { useAppStore } from "@/stores/app-store"

export function handleConversationEvents(socket: Socket) {
  try {
    socket.on(EVENTS.CONVERSATION_CREATED, (conversation: ConversationItem) => {
      console.log("CONVERSATION_CREATED")
      const chatState = useChatStore.getState()
      const existed = chatState.conversations.some((c) => c.id === conversation.id)
      chatState.appendConversations([conversation])

      if (!existed && (conversation.unreadCount ?? 0) > 0) {
        useAppStore.getState().incrementConversationsUnreadCount(1)
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling conversation events:", message)
  }
}
