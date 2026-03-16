import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile } from "@workspace/shared"

type AuthState = {
  accessToken: string | null
  user: UserProfile | null
}

type AuthActions = {
  setAuth: (token: string, user: UserProfile) => void
  setUser: (user: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAuth: (token, user) => set({ accessToken: token, user }),

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    },
  ),
)
