import type { Socket } from "socket.io-client"
import { EVENTS } from "@/lib/socket-events"
import type { MessageItem } from "@/lib/types"
import type { MessageDeliveryEvent } from "@/lib/socket-event-payloads"
import { useChatStore } from "@/stores/chat-store"
import { useAppStore } from "@/stores/app-store"
import { toast } from "@workspace/ui/components/sonner"

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
    socket.on(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, (payload: MessageDeliveryEvent) => {
      useChatStore.getState().updateConversationMessageStatus(payload.conversationId, payload.messageId, payload.status)
    })
    socket.on(EVENTS.MESSAGE_DELIVERY_FAILED, (payload: MessageDeliveryEvent) => {
      useChatStore.getState().updateConversationMessageStatus(payload.conversationId, payload.messageId, payload.status)
      if (payload.errorMessage) {
        toast.error(payload.errorMessage, { position: "bottom-right" })
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling message events:", message)
  }
}
