"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()

      const socket = getSocket()
      const handleConnected = () => {
        queryClient.invalidateQueries({ queryKey: ["app", "init"] })
      }

      socket?.on("connect", handleConnected)

      return () => {
        socket?.off("connect", handleConnected)
        disconnectSocket()
      }
    } else {
      disconnectSocket()
      return
    }
  }, [isAuthenticated, queryClient])

  return <>{children}</>
}
