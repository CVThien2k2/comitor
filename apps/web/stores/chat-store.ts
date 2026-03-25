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

export const useChatStore = create<ChatState & ChatActions>()((set) => ({
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
      return { conversations: next }
    }),

  appendConversationMessages: (conversationId, incoming) =>
    set((state) => {
      if (incoming.length === 0) return {}
      const patchMessages = (c: Conversation) => mergeMessagesNewestFirst(c.messages, incoming)
      return {
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? { ...state.selectedConversation, messages: patchMessages(state.selectedConversation) }
            : state.selectedConversation,
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: patchMessages(c) } : c
        ),
      }
    }),

  reset: () => set({ conversations: [], selectedConversation: null }),
}))
