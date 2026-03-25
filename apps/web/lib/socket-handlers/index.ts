import type { Socket } from "socket.io-client"
import { handleLifecycleEvents } from "./lifecycle"
import { handleConversationEvents } from "./conversation"
import { handleMessageEvents } from "./message"

/** Đăng ký listener socket (gọi một lần sau khi `io(...)`). */
export function registerSocketHandlers(socket: Socket) {
  handleLifecycleEvents(socket)
  handleConversationEvents(socket)
  handleMessageEvents(socket)
}
