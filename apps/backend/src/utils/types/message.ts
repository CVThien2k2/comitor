export type Platform = "zalo_personal" | "zalo_oa" | "meta"

export type MessageType = "text" | "image" | "file" | "video" | "audio" | "sticker" | "unknown" | "template" | "media"

export interface Attachment {
  type: MessageType
  url?: string
  name?: string
  size?: number
  mimeType?: string
  thumbnail?: string
}

export interface Message {
  eventName?: string
  platform: Platform
  messageId: string
  conversationId: string
  senderId: string
  recipientId: string
  timestamp: number
  type: MessageType
  text?: string
  attachments?: Attachment[]
  // raw?: unknown;
}

/**
 * Payload gửi tin nhắn chung cho tất cả các nền tảng.
 * Đối với ZaloOA, conversationId là id của người dùng.
 */
export interface SendMessagePayload {
  platform: Platform
  senderId: string
  recipientId: string
  conversationId: string
  type: MessageType
  text: string
  attachments: string[]
}
