"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useStoreHydration } from "@/hooks/use-store-hydration"
import { users } from "@/api/users"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useStoreHydration()
  const { accessToken, setUser, logout } = useAuthStore()

  const { data, isError, isLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: users.getMe,
    enabled: hydrated && !!accessToken,
    retry: false,
  })

  useEffect(() => {
    if (data?.data) {
      setUser(data.data)
    }
  }, [data, setUser])

  useEffect(() => {
    if (isError && accessToken) {
      logout()
    }
  }, [isError, accessToken, logout])

  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace("/login")
    }
  }, [hydrated, accessToken, router])

  if (!hydrated || (accessToken && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!accessToken) return null

  return <>{children}</>
}
