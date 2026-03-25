import type { Socket } from "socket.io-client"
import { EVENTS } from "@workspace/shared/socket-events"
import type { MessageItem } from "@workspace/shared"
import { useChatStore } from "@/stores/chat-store"

export function handleMessageEvents(socket: Socket) {
  try {
    socket.on(EVENTS.MESSAGE_CREATED, (message: MessageItem) => {
      useChatStore.getState().appendConversationMessages(message.conversationId, [message])
    })
    socket.on(
      EVENTS.MESSAGE_DELIVERY_SUCCEEDED,
      (payload: { messageId: string; conversationId: string; status: MessageItem["status"] }) => {
        useChatStore
          .getState()
          .updateConversationMessageStatus(payload.conversationId, payload.messageId, payload.status)
      }
    )
    socket.on(
      EVENTS.MESSAGE_DELIVERY_FAILED,
      (payload: { messageId: string; conversationId: string; status: MessageItem["status"] }) => {
        useChatStore
          .getState()
          .updateConversationMessageStatus(payload.conversationId, payload.messageId, payload.status)
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling message events:", message)
  }
}
