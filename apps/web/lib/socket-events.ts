/** Tên event socket — giữ đồng bộ với backend. */
export const EVENTS = {
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  CONVERSATION_CREATED: "conversation-created",
  MESSAGE_CREATED: "message-created",
  MESSAGE_DELIVERY_SUCCEEDED: "message-delivery-succeeded",
  MESSAGE_DELIVERY_FAILED: "message-delivery-failed",
} as const

export type SocketEvent = (typeof EVENTS)[keyof typeof EVENTS]
