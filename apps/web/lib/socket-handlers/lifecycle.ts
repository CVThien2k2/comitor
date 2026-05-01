import type { Socket } from "socket.io-client"
import { EVENTS } from "@/lib/socket-events"
import type { UserStatusEvent } from "@/lib/socket-event-payloads"

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

    socket.on(EVENTS.USER_ONLINE, (payload: UserStatusEvent) => {
      console.log("[Socket] USER_ONLINE", payload)
    })

    socket.on(EVENTS.USER_OFFLINE, (payload: UserStatusEvent) => {
      console.log("[Socket] USER_OFFLINE", payload)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling lifecycle events:", message)
  }
}
