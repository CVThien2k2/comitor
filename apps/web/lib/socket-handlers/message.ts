import type { Socket } from "socket.io-client"
import { EVENTS } from "@workspace/shared/socket-events"

export function handleMessageEvents(socket: Socket) {
  try {
    socket.on(EVENTS.MESSAGE_CREATED, (message) => {
      console.log("[Socket] MESSAGE_CREATED", message)
    })
    socket.on(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, (message) => {
      console.log("[Socket] MESSAGE_DELIVERY_SUCCEEDED", message)
    })
    socket.on(EVENTS.MESSAGE_DELIVERY_FAILED, (message) => {
      console.log("[Socket] MESSAGE_DELIVERY_FAILED", message)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling message events:", message)
  }
}
