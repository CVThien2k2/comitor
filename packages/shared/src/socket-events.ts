/** Hằng tên event socket. Entry riêng cho client — không import database. */
export const EVENTS = {
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  MESSAGE_CREATED: "message-created",
  MESSAGE_DELIVERY_SUCCEEDED: "message-delivery-succeeded",
  MESSAGE_DELIVERY_FAILED: "message-delivery-failed",
} as const

export type SocketEvent = (typeof EVENTS)[keyof typeof EVENTS]
