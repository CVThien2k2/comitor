"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (accessToken) {
      connectSocket()

      const socket = getSocket()

      const handleConnected = () => {
        if (!isAuthenticated) {
          queryClient.invalidateQueries({ queryKey: ["app", "init"] })
        }
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
  }, [accessToken, queryClient, isAuthenticated])

  return <>{children}</>
}
