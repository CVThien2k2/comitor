import type { AppData } from "@/api"
import { create } from "zustand"

type AppState = {
  badges: AppData["badges"]
}

type AppActions = {
  setBadges: (badges: AppData["badges"]) => void
  reset: () => void
}

export const useAppStore = create<AppState & AppActions>()((set) => ({
  badges: {
    conversationsUnreadCount: 0,
  },

  setBadges: (badges) => set({ badges }),

  reset: () =>
    set({
      badges: {
        conversationsUnreadCount: 0,
      },
    }),
}))
