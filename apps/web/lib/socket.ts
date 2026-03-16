import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/stores/auth-store"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket() {
  const token = useAuthStore.getState().accessToken
  if (!token || socket?.connected) return

  socket = io(`${SOCKET_URL}/websocket`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id)
  })

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason)
  })

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message)
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
