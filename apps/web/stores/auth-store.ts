import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ApiResponse, UserProfile } from "@/lib/types"

type AuthState = {
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
}

type AuthActions = {
  setAuth: (token: string, user: UserProfile) => void
  setUser: (user: UserProfile) => void
  clearAuth: () => void
  logout: () => Promise<ApiResponse<null>>
}

const emptyAuthState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...emptyAuthState,

      setAuth: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearAuth: () => set(emptyAuthState),

      logout: async () => {
        const { api } = await import("@/lib/axios")
        const response = await api.post<ApiResponse<null>>("/auth/logout")

        set(emptyAuthState)
        return response
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
)
