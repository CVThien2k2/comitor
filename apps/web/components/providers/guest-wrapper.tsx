"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useStoreHydration } from "@/hooks/use-store-hydration"

export function GuestWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useStoreHydration()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/")
    }
  }, [hydrated, accessToken, router])

  if (!hydrated || accessToken) return null

  return <>{children}</>
}
