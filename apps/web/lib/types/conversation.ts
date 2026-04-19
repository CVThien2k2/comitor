import type { ChannelType } from "@workspace/database"

// ─── Message ────────────────────────────────────────────

export interface MessageAttachment {
  id: string
  messageId: string
  fileName: string | null
  fileType: string | null
  fileUrl: string | null
  thumbnailUrl: string | null
  fileMimeType: string | null
  key: string | null
  createdAt: string | null
}

export interface MessageItem {
  id: string
  conversationId: string
  senderType: "agent" | "customer" | "system"
  accountCustomerId: string | null
  userId: string | null
  content: string | null
  status: "processing" | "success" | "failed"
  externalId: string | null
  isRead: boolean
  timestamp: string
  createdAt: string
  updatedAt: string
  attachments?: MessageAttachment[]
  user?: { id: string; name: string; avatarUrl: string | null } | null
  accountCustomer?: {
    id: string
    goldenProfileId: string | null
    avatarUrl: string | null
    name: string | null
  } | null
}

// ─── Conversation ───────────────────────────────────────

/** Bản serialize API (chuỗi ISO) — khác model Prisma cùng tên. */
export interface LinkAccount {
  id: string
  provider: ChannelType
  linkedByUserId: string
  providerCredentialsId: string | null
  displayName: string | null
  accountId: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  status: "active" | "inactive"
}

export interface ConversationViewer {
  id: string
  name: string
  avatarUrl: string | null
}

export interface Conversation {
  id: string
  linkedAccountId: string
  name: string | null
  avatarUrl: string | null
  externalId: string | null
  type: "personal" | "group"
  tag: "other" | "business"
  journeyState: string | null
  lastActivityAt: string | null
  lastViewedById: string | null
  lastViewedAt: string | null
  accountCustomerId: string | null
  createdAt: string
  updatedAt: string
  linkedAccount?: LinkAccount
  lastViewedBy?: ConversationViewer | null
  accountCustomer?: {
    id: string
    goldenProfileId: string | null
    avatarUrl: string | null
    name: string | null
  }
  conversationCustomers?: {
    id: string
    conversationId: string
    accountCustomerId: string
    isAdmin: boolean
    createdAt: string
    updatedAt: string
    accountCustomer?: {
      id: string
      goldenProfileId: string | null
      avatarUrl: string | null
      name: string | null
    }
  }[]
  messages?: MessageItem[]
  unreadCount?: number
}

export interface CreateMessagePayload {
  conversationId: string
  content?: string
  attachments?: {
    fileName?: string
    fileType?: string
    fileUrl?: string
    thumbnailUrl?: string
    fileMimeType?: string
    key?: string
  }[]
}
