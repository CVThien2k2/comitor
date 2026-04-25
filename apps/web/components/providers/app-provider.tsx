"use client"

import { app } from "@/api"
import { useStoreHydration } from "@/hooks/use-store-hydration"
import { useAppStore } from "@/stores/app-store"
import { useAuthStore } from "@/stores/auth-store"
import { useQuery } from "@tanstack/react-query"
import LoadingUI from "../global/loading-ui"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useStoreHydration()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { isLoading, isFetched } = useQuery({
    queryKey: ["app", "init"],
    queryFn: async () => {
      try {
        const res = await app.init()
        if (res.data?.user) useAuthStore.getState().setUser(res.data.user)
        if (res.data?.badges) useAppStore.getState().setBadges(res.data.badges)
        if (res.data?.permissions) useAuthStore.getState().setPermissions(res.data.permissions)
        return res
      } catch (error: unknown) {
        const statusCode =
          typeof error === "object" && error !== null
            ? ((error as { statusCode?: number; status?: number }).statusCode ??
              (error as { statusCode?: number; status?: number }).status)
            : undefined

        if (statusCode === 401) {
          useAppStore.getState().reset()
          throw new Error("Unauthorized")
        }

        throw error
      }
    },
    enabled: hydrated && !!accessToken,
    retry: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  if (!hydrated || (accessToken && !isFetched && isLoading)) {
    return <LoadingUI />
  }

  return <>{children}</>
}
