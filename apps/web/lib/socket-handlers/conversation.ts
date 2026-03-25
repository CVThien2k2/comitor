import { EVENTS } from "@workspace/shared/socket-events"
import type { Socket } from "socket.io-client"
import type { Conversation } from "@workspace/shared"
import { useChatStore } from "@/stores/chat-store"

export function handleConversationEvents(socket: Socket) {
  try {
    socket.on(EVENTS.CONVERSATION_CREATED, (conversation: Conversation) => {
      // Add new conversation into Zustand immediately (for UI list update).
      useChatStore.getState().appendConversations([conversation])
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling conversation events:", message)
  }
}
