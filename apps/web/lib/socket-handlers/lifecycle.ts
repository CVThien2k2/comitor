import type { Socket } from "socket.io-client"

export function handleLifecycleEvents(socket: Socket) {
  try {
    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id)
    })

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason)
    })

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling lifecycle events:", message)
  }
}
