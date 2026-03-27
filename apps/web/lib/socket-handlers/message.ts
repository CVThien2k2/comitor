import type { Socket } from "socket.io-client"
import { EVENTS } from "@workspace/shared/socket-events"
import type { MessageItem } from "@workspace/shared"
import { useChatStore } from "@/stores/chat-store"
import { useAppStore } from "@/stores/app-store"

export function handleMessageEvents(socket: Socket) {
  try {
    socket.on(EVENTS.MESSAGE_CREATED, (message: MessageItem) => {
      console.log("MESSAGE_CREATED")
      const chatState = useChatStore.getState()
      const beforeUnreadCount = chatState.conversations.find((c) => c.id === message.conversationId)?.unreadCount ?? 0

      chatState.appendConversationMessages(message.conversationId, [message])

      const afterUnreadCount =
        useChatStore.getState().conversations.find((c) => c.id === message.conversationId)?.unreadCount ?? 0
      const shouldIncreaseBadge = !message.isRead && beforeUnreadCount <= 0 && afterUnreadCount > 0

      if (shouldIncreaseBadge) {
        useAppStore.getState().incrementConversationsUnreadCount(1)
      }
    })
    socket.on(
      EVENTS.MESSAGE_DELIVERY_SUCCEEDED,
      (payload: { messageId: string; conversationId: string; status: MessageItem["status"] }) => {
        console.log("MESSAGE_DELIVERY_SUCCEEDED")
        useChatStore
          .getState()
          .updateConversationMessageStatus(payload.conversationId, payload.messageId, payload.status)
      }
    )
    socket.on(
      EVENTS.MESSAGE_DELIVERY_FAILED,
      (payload: { messageId: string; conversationId: string; status: MessageItem["status"] }) => {
        console.log("MESSAGE_DELIVERY_FAILED")
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
