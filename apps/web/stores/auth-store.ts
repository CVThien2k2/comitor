import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile } from "@/lib/types"
import type { PermissionCode } from "@workspace/database"

type AuthState = {
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  permissions: PermissionCode[]
}

type AuthActions = {
  setAuth: (token: string, user: UserProfile) => void
  setUser: (user: UserProfile) => void
  setPermissions: (permissions: PermissionCode[]) => void
  logout: () => void
}

const emptyAuthState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  permissions: [],
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...emptyAuthState,

      setAuth: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      setPermissions: (permissions) => set({ permissions }),

      logout: () => set(emptyAuthState),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
)
