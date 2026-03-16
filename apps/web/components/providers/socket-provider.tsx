"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { connectSocket, disconnectSocket } from "@/lib/socket"

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated])

  return <>{children}</>
}
