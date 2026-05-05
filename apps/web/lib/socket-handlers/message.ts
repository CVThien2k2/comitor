import type { MessageDeliveryEvent } from "@/lib/socket-event-payloads"
import { EVENTS } from "@/lib/socket-events"
import type { ConversationItem, MessageItem } from "@/lib/types"
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
    // Luồng realtime khi backend phát sinh message mới.
    // Mục tiêu: cập nhật conversation list tại chỗ để UI phản ứng ngay, không chờ refetch.
    socket.on(EVENTS.MESSAGE_CREATED, (message: MessageItem) => {
      useChatStore.setState((state) => {
        // 1) Chỉ cập nhật khi conversation đã tồn tại trong store hiện tại.
        const targetConversation = state.conversations.find(
          (conversation) => conversation.id === message.conversationId
        )
        if (!targetConversation) return state

        // 2) Chặn duplicate event (socket reconnect hoặc server phát lại).
        const messageExists = targetConversation.messages.some((item) => item.id === message.id)
        if (messageExists) return state

        // 3) Nếu là tin nhắn khách gửi vào thì conversation trở thành unread và tăng bộ đếm unread.
        //    Nếu là agent gửi thì giữ nguyên trạng thái unread.
        const isIncomingFromCustomer = message.senderType === "customer"
        const nextUnreadCount = isIncomingFromCustomer
          ? Math.max(0, (targetConversation.countUnreadMessages ?? 0) + 1)
          : targetConversation.countUnreadMessages

        const nextConversation: ConversationItem = {
          ...targetConversation,
          // 4) Theo yêu cầu hiện tại: add message realtime vào đầu danh sách message.
          messages: [message, ...targetConversation.messages],
          // Đồng bộ mốc hoạt động mới nhất để conversation được đẩy lên đầu list.
          lastActivityAt: message.timestamp || message.createdAt || new Date().toISOString(),
          countUnreadMessages: nextUnreadCount,
          unreadCount: nextUnreadCount,
          isUnread: isIncomingFromCustomer ? true : targetConversation.isUnread,
        }

        // 5) Ghi đè conversation vừa đổi và sort lại toàn bộ list theo lastActivityAt.
        //    Nhờ vậy panel danh sách hội thoại luôn phản ánh đúng thứ tự realtime.
        const conversations = sortByLastActivity(
          state.conversations.map((conversation) =>
            conversation.id === message.conversationId ? nextConversation : conversation
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
