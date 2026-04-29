import type { Socket } from "socket.io-client"
import { EVENTS } from "@/lib/socket-events"
import type { MessageItem } from "@/lib/types"
import type { MessageDeliveryEvent } from "@/lib/socket-event-payloads"
import { toast } from "@workspace/ui/components/sonner"

export function handleMessageEvents(socket: Socket) {
  try {
    socket.on(EVENTS.MESSAGE_CREATED, (message: MessageItem) => {
      // Store đã tối giản, tạm thời chỉ log event.
      console.log("MESSAGE_CREATED", message)
    })

    socket.on(EVENTS.MESSAGE_DELIVERY_SUCCEEDED, (payload: MessageDeliveryEvent) => {
      // Store đã tối giản, tạm thời chỉ log event.
      console.log("MESSAGE_DELIVERY_SUCCEEDED", payload)
    })

    socket.on(EVENTS.MESSAGE_DELIVERY_FAILED, (payload: MessageDeliveryEvent) => {
      // Store đã tối giản, tạm thời chỉ log event.
      console.log("MESSAGE_DELIVERY_FAILED", payload)
      if (payload.errorMessage) {
        toast.error(payload.errorMessage, { position: "bottom-right" })
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[WebSocket] Error handling message events:", message)
  }
}
