import type { AppData } from "@/api"
import { create } from "zustand"

type AppState = {
  badges: AppData["badges"]
}

type AppActions = {
  setBadges: (badges: AppData["badges"]) => void
  decrementConversationsUnreadCount: (delta?: number) => void
  reset: () => void
}

export const useAppStore = create<AppState & AppActions>()((set) => ({
  badges: {
    conversationsUnreadCount: 0,
  },

  setBadges: (badges) => set({ badges }),

  decrementConversationsUnreadCount: (delta = 1) =>
    set((state) => ({
      badges: {
        ...state.badges,
        conversationsUnreadCount: Math.max(0, (state.badges.conversationsUnreadCount ?? 0) - delta),
      },
    })),

  reset: () =>
    set({
      badges: {
        conversationsUnreadCount: 0,
      },
    }),
}))
