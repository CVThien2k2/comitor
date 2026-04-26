import { io, type Socket } from "socket.io-client"
import { API_URL } from "@/lib/constants"
import { useAuthStore } from "@/stores/auth-store"
import { registerSocketHandlers } from "@/lib/socket-handlers"

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket() {
  const token = useAuthStore.getState().accessToken
  if (!token) return
  if (socket) return

  socket = io(`${API_URL}/websocket`, {
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
