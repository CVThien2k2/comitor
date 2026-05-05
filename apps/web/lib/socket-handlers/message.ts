import type { MessageDeliveryEvent } from "@/lib/socket-event-payloads"
import { EVENTS } from "@/lib/socket-events"
import type { ConversationItem, MessageItem } from "@/lib/types"
import { useAppStore } from "@/stores/app-store"
import { useChatStore } from "@/stores/chat-store"
import type { Socket } from "socket.io-client"

function sortByLastActivity(conversations: ConversationItem[]) {
  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastActivityAt).getTime()
    const timeB = new Date(b.lastActivityAt).getTime()
    if (timeA !== timeB) return timeB - timeA
    return a.id.localeCompare(b.id)
  })
}

export function handleMessageEvents(socket: Socket) {
  try {
    socket.on(EVENTS.MESSAGE_CREATE, (incomingConversation: ConversationItem) => {
      const incomingMessage = incomingConversation.messages?.[0]
      const chatState = useChatStore.getState()
      const existsConversation = chatState.conversations.find((item) => item.id === incomingConversation.id)

      if (!existsConversation) {
        chatState.appendConversations([incomingConversation])
        if (incomingConversation.isUnread || (incomingConversation.countUnreadMessages ?? 0) > 0) {
          useAppStore.getState().incrementConversationsUnreadCount(1)
        }
        return
      }

      if (!incomingMessage) return
      if (existsConversation.messages.some((item) => item.id === incomingMessage.id)) return

      useChatStore.setState((state) => {
        const targetConversation = state.conversations.find(
          (conversation) => conversation.id === incomingConversation.id
        )
        if (!targetConversation) return state

        const nextConversation: ConversationItem = {
          ...targetConversation,
          ...incomingConversation,
          messages: [incomingMessage, ...targetConversation.messages],
        }

        const conversations = sortByLastActivity(
          state.conversations.map((conversation) =>
            conversation.id === incomingConversation.id ? nextConversation : conversation
          )
        )
        return { conversations }
      })
    })

    socket.on(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, (payload: MessageDeliveryEvent) => {
      useChatStore.getState().updateMessageStatus(payload.conversationId, payload.messageId, payload.status)
    })

    socket.on(EVENTS.MESSAGE_DELIVERY_FAILED, (payload: MessageDeliveryEvent) => {
      useChatStore.getState().updateMessageStatus(payload.conversationId, payload.messageId, payload.status)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling message events:", message)
  }
}
