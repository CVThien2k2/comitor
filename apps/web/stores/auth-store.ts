import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile } from "@workspace/shared"

type AuthState = {
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
}

type AuthActions = {
  setAuth: (token: string, user: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),

      logout: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
