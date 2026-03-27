import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/stores/auth-store"
import { registerSocketHandlers } from "@/lib/socket-handlers"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket() {
  const token = useAuthStore.getState().accessToken
  if (!token) return
  if (socket) return

  socket = io(`${SOCKET_URL}/websocket`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 5000,
  })

  registerSocketHandlers(socket)
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
