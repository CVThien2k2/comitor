"use client"

import { useQuery } from "@tanstack/react-query"
import { Icons } from "@/components/global/icons"
import { useAuthStore } from "@/stores/auth-store"
import { useStoreHydration } from "@/hooks/use-store-hydration"
import { users } from "@/api/users"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useStoreHydration()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { isLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      try {
        const res = await users.getMe()
        if (res.data) {
          useAuthStore.getState().setUser(res.data)
        }
        return res
      } catch {
        useAuthStore.getState().logout()
        throw new Error("Unauthorized")
      }
    },
    enabled: hydrated && !!accessToken,
    retry: false,
  })

  if (!hydrated || (accessToken && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
