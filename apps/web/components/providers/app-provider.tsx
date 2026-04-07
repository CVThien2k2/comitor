"use client"

import { useQuery } from "@tanstack/react-query"
import { Icons } from "@/components/global/icons"
import { useAuthStore } from "@/stores/auth-store"
import { useStoreHydration } from "@/hooks/use-store-hydration"
import { app } from "@/api"
import { useAppStore } from "@/stores/app-store"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useStoreHydration()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { isLoading } = useQuery({
    queryKey: ["app", "init"],
    queryFn: async () => {
      try {
        const res = await app.init()
        if (res.data?.user) useAuthStore.getState().setUser(res.data.user)
        if (res.data?.badges) useAppStore.getState().setBadges(res.data.badges)
        return res
      } catch (error: unknown) {
        const statusCode =
          typeof error === "object" && error !== null
            ? (error as { statusCode?: number; status?: number }).statusCode ??
              (error as { statusCode?: number; status?: number }).status
            : undefined

        if (statusCode === 401) {
          useAuthStore.getState().clearAuth()
          useAppStore.getState().reset()
          throw new Error("Unauthorized")
        }

        throw error
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
