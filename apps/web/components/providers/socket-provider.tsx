"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (accessToken) {
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
  }, [accessToken, queryClient])

  return <>{children}</>
}
