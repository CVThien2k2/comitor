import { ChannelType, Gender } from "@workspace/database"

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  VIDEO = "video",
  AUDIO = "audio",
  STICKER = "sticker",
  GIF = "gif",
  RECOMMENDED = "recommended", //Danh thiếp
  LOCATION = "location", //Vị trí
  TEMPLATE = "template",
}

export enum EventMessage {
  INBOUND = "inbound", // Tin nhắn đến
  OUTBOUND = "outbound", // Tin nhắn đi
}

export interface MessagePlatform {
  eventName: EventMessage
  provider: ChannelType
  isGroupMessage: boolean
  messageId: string
  senderId: string
  recipientId: string
  timestamp: number
  type: MessageType
  content: ContentMessage[]
}

/**
 * Payload gửi tin nhắn chung cho tất cả các nền tảng.
 */
export interface SendMessagePayload {
  provider: ChannelType
  senderId: string
  recipientId: string
  conversationId: string
  text: string
  attachments: string[]
}

export type ContentMessage = {
  type?: string
  quote_msg_id?: string // ID của tin nhắn được trích dẫn nếu có (trả lời tin nhắn)
  text?: string // Text của tin nhắn văn bản nếu có

  url?: string // Url của file nếu có
  thumbnailUrl?: string // Thumbnail của file nếu có
  name?: string // Tên của file nếu có
  description?: string // Mô tả của file nếu có
  size?: number | string // Kích thước của file nếu có

  stickerId?: string // ID của sticker nếu có
  coordinates?: Coordinates // Vị trí của tin nhắn nếu có
}

type Coordinates = {
  latitude: string
  longitude: string
}

export interface UserProfilePlatform {
  //Thông tin người dùng từ nền tảng
  accountId: string
  fullName: string
  gender?: Gender
  dateOfBirth?: string
  primaryPhone?: string
  avatarUrl?: string
  bgavatar?: string
  isFriend?: boolean
  isBlocked?: boolean
  isActive?: boolean
}
