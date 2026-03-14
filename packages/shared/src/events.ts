/** Socket events (emitted to clients via Socket.IO) */
export const EVENTS = {
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
} as const

export type UserStatusEvent = {
  userId: string
}

export type SocketEvent = (typeof EVENTS)[keyof typeof EVENTS]
