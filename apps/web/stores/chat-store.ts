import { create } from "zustand"
import type { Conversation, MessageItem } from "@workspace/shared"

/** Gộp theo id, sắp xếp tin mới nhất trước (`messages[0]` = mới nhất cho list). */
function mergeMessagesNewestFirst(existing: MessageItem[] | undefined, incoming: MessageItem[]): MessageItem[] {
  const byId = new Map<string, MessageItem>()
  for (const m of existing ?? []) byId.set(m.id, m)
  for (const m of incoming) byId.set(m.id, m)
  return [...byId.values()].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime()
    const tb = new Date(b.timestamp).getTime()
    if (ta !== tb) return tb - ta
    return b.id.localeCompare(a.id)
  })
}

type ChatState = {
  conversations: Conversation[]
  selectedConversation: Conversation | null
}

type ChatActions = {
  setSelectedConversation: (conversation: Conversation | null) => void
  setConversations: (conversations: Conversation[]) => void
  /** Thêm các hội thoại mới (trang tiếp theo), bỏ qua id trùng */
  appendConversations: (incoming: Conversation[]) => void
  /**
   * Thêm/cập nhật tin (realtime, gửi tin, …). `messages` luôn mới nhất trước (`messages[0]` = preview list).
   */
  appendConversationMessages: (conversationId: string, incoming: MessageItem[]) => void
  /** Cập nhật `status` (vd. optimistic lỗi → `failed`). */
  updateConversationMessageStatus: (conversationId: string, messageId: string, status: MessageItem["status"]) => void
  /** Bỏ tin `messageId`, thêm/merge `message` (vd. optimistic → tin từ server). */
  replaceMessage: (conversationId: string, messageId: string, message: MessageItem) => void
  /**
   * Đánh dấu conversation đã đọc trên state hiện tại:
   * - `conversation.unreadCount = 0`
   * - `messages[].isRead = true` (chỉ áp dụng cho messages đang có trong store)
   * @returns `{ wasUnread, hasUnreadInState }` để caller quyết định decrement/un-sync server
   */
  markAsRead: (conversationId: string) => { wasUnread: boolean; hasUnreadInState: boolean }
  reset: () => void
}

function dedupeById(items: Conversation[]): Conversation[] {
  const seen = new Set<string>()
  return items.filter((c) => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })
}

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  conversations: [],
  selectedConversation: null,

  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),

  setConversations: (conversations) => set({ conversations: dedupeById(conversations) }),

  appendConversations: (incoming) =>
    set((state) => {
      const seen = new Set(state.conversations.map((c) => c.id))
      const next = [...state.conversations]
      for (const c of incoming) {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          next.push(c)
        }
      }
      const sortByLastActivityDesc = (a: Conversation, b: Conversation) => {
        const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        if (ta !== tb) return tb - ta
        return b.id.localeCompare(a.id)
      }

      return { conversations: next.slice().sort(sortByLastActivityDesc) }
    }),

  appendConversationMessages: (conversationId, incoming) =>
    set((state) => {
      if (incoming.length === 0) return {}

      // `unreadCount` đại diện cho tổng số message chưa đọc của cả conversation.
      // Trong `state`, `conversation.messages` có thể chỉ chứa subset (vd: list chỉ include 1 tin nhắn gần nhất),
      // nên không thể "recount" bằng `messages.filter(!isRead)` mà phải cập nhật theo delta từ `incoming`.
      const selected = state.selectedConversation?.id === conversationId ? state.selectedConversation : null
      const listConversation = state.conversations.find((c) => c.id === conversationId) ?? null

      const currentUnreadCount = Math.max(listConversation?.unreadCount ?? 0, selected?.unreadCount ?? 0)
      let deltaUnread = 0

      for (const m of incoming) {
        const prevInSelected = selected?.messages?.find((x) => x.id === m.id)
        const prevInList = prevInSelected ? undefined : listConversation?.messages?.find((x) => x.id === m.id)
        const prev = prevInSelected ?? prevInList

        if (prev) {
          if (!prev.isRead && m.isRead) deltaUnread -= 1
          if (prev.isRead && !m.isRead) deltaUnread += 1
        } else {
          if (!m.isRead) deltaUnread += 1
        }
      }

      const nextUnreadCount = Math.max(0, currentUnreadCount + deltaUnread)

      const newestMessageCreatedAt = incoming.reduce((max, m) => {
        const t = m.createdAt ? new Date(m.createdAt).getTime() : new Date(m.timestamp).getTime()
        return t > max ? t : max
      }, 0)
      const newestLastActivityAt = new Date(newestMessageCreatedAt).toISOString()

      const patchMessages = (c: Conversation) => mergeMessagesNewestFirst(c.messages, incoming)

      const sortByLastActivityDesc = (a: Conversation, b: Conversation) => {
        const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        if (ta !== tb) return tb - ta
        return b.id.localeCompare(a.id)
      }
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? {
                ...state.selectedConversation,
                messages: patchMessages(state.selectedConversation),
                unreadCount: nextUnreadCount,
                lastActivityAt: newestLastActivityAt,
              }
            : state.selectedConversation,
        conversations: state.conversations
          .map((c) =>
            c.id === conversationId
              ? { ...c, messages: patchMessages(c), unreadCount: nextUnreadCount, lastActivityAt: newestLastActivityAt }
              : c
          )
          .slice()
          .sort(sortByLastActivityDesc),
      }
    }),

  updateConversationMessageStatus: (conversationId, messageId, status) =>
    set((state) => {
      const now = new Date().toISOString()
      const patch = (c: Conversation) => ({
        ...c,
        messages: (c.messages ?? []).map((m) => (m.id === messageId ? { ...m, status, updatedAt: now } : m)),
      })
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    }),

  replaceMessage: (conversationId, messageId, message) =>
    set((state) => {
      const patch = (c: Conversation) => {
        const without = (c.messages ?? []).filter((m) => m.id !== messageId)
        return { ...c, messages: mergeMessagesNewestFirst(without, [message]) }
      }
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    }),

  markAsRead: (conversationId) => {
    const { conversations, selectedConversation } = get()

    const foundUnreadCount = conversations.find((c) => c.id === conversationId)?.unreadCount ?? 0
    const selectedUnreadCount =
      selectedConversation?.id === conversationId ? (selectedConversation.unreadCount ?? 0) : 0

    const currentUnreadCount = Math.max(foundUnreadCount, selectedUnreadCount)
    const wasUnread = currentUnreadCount > 0

    const foundUnreadMessage = (conversations.find((c) => c.id === conversationId)?.messages ?? []).some(
      (m) => !m.isRead
    )
    const selectedUnreadMessage =
      selectedConversation?.id === conversationId ? (selectedConversation.messages ?? []).some((m) => !m.isRead) : false

    const hasUnreadInState = foundUnreadMessage || selectedUnreadMessage
    if (!wasUnread && !hasUnreadInState) return { wasUnread: false, hasUnreadInState: false }

    set((state) => {
      const patch = (c: Conversation): Conversation => {
        const messages = c.messages ? c.messages.map((m) => ({ ...m, isRead: true })) : c.messages
        return { ...c, unreadCount: 0, messages }
      }

      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? patch(state.selectedConversation)
            : state.selectedConversation,
        conversations: state.conversations.map((c) => (c.id === conversationId ? patch(c) : c)),
      }
    })

    return { wasUnread, hasUnreadInState }
  },

  reset: () => set({ conversations: [], selectedConversation: null }),
}))
