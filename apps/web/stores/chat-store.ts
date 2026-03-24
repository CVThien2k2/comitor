import { create } from "zustand"
import type { Conversation } from "@workspace/shared"

// ─── Types ──────────────────────────────────────────────

type ChatState = {
  selectedConversation: Conversation | null
}

type ChatActions = {
  setSelectedConversation: (conversation: Conversation | null) => void
  reset: () => void
}

// ─── Store ──────────────────────────────────────────────

export const useChatStore = create<ChatState & ChatActions>()((set) => ({
  selectedConversation: null,

  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),

  reset: () => set({ selectedConversation: null }),
}))
