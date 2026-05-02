import type {
  ChannelType,
  ConversationStatus,
  ConversationTag,
  ConversationType,
  JourneyState,
  MessageSender,
  MessageStatus,
  MessageType,
} from "@workspace/database"

export type Coordinates = {
  latitude: string
  longitude: string
}

export type ContentMessage = {
  type?: string
  quote_msg_id?: string
  text?: string
  url?: string
  thumbnailUrl?: string
  name?: string
  description?: string
  size?: number | string
  stickerId?: string
  coordinates?: Coordinates
  /** Payload Zalo (vd. height, width, hd, tracking) khi nền tảng gửi kèm. */
  params?: Record<string, unknown>
  actions?: string
}
export interface AccountCustomerItem {
  id: string
  goldenProfileId?: string | null
  avatarUrl: string | null
  name: string | null
}

export interface ConversationLinkAccountItem {
  id: string
  provider: ChannelType
  displayName: string | null
}

export interface MessageItem {
  id: string
  conversationId: string
  senderType: MessageSender
  accountCustomerId: string | null
  quoteMessageId: string | null
  content: string | ContentMessage | ContentMessage[] | null
  status: MessageStatus
  externalId: string | null
  isRead: boolean
  timestamp: string
  type: MessageType
  createdBy: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  createdByUser?: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  accountCustomer?: AccountCustomerItem | null
}

export interface ConversationItem {
  id: string
  linkedAccountId: string
  name: string
  avatarUrl: string | null
  externalId: string | null
  type: ConversationType
  tag: ConversationTag
  journeyState: JourneyState | null
  status: ConversationStatus
  countUnreadMessages: number
  isUnread: boolean
  processingBy: string | null
  lastActivityAt: string
  lastViewedAt: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  linkedAccount: ConversationLinkAccountItem
  messages: MessageItem[]
  unreadCount?: number
  accountCustomerId?: string | null
  accountCustomer?: AccountCustomerItem | null
}
