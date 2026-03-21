import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse } from "@workspace/shared"

// ─── Conversation Types ─────────────────────────────────

export interface ConversationLastMessage {
  content: string | null
  senderType: "agent" | "customer" | "system"
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null } | null
  accountCustomer: {
    id: string
    avatarUrl: string | null
    goldenProfile: { fullName: string | null }
  } | null
}

export interface ConversationItem {
  id: string
  linkedAccountId: string
  name: string | null
  externalId: string | null
  type: "personal" | "group"
  tag: "other" | "business"
  journeyState: string | null
  lastActivityAt: string | null
  accountCustomerId: string | null
  createdAt: string
  updatedAt: string
  linkedAccount: { provider: string }
  lastMessage: ConversationLastMessage | null
  unreadCount: number
}

export interface ConversationDetail {
  id: string
  linkedAccountId: string
  name: string | null
  externalId: string | null
  type: "personal" | "group"
  tag: "other" | "business"
  journeyState: string | null
  lastActivityAt: string | null
  accountCustomerId: string | null
  createdAt: string
  updatedAt: string
  linkedAccount: Record<string, unknown>
  conversationCustomers: {
    id: string
    conversationId: string
    accountCustomerId: string
    isAdmin: boolean
    accountCustomer: Record<string, unknown>
  }[]
}

// ─── Message Types ──────────────────────────────────────

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
  createdAt: string
  updatedAt: string
  attachments: MessageAttachment[]
  user: { id: string; name: string; avatarUrl: string | null } | null
  accountCustomer: {
    id: string
    avatarUrl: string | null
    goldenProfile: { fullName: string | null }
  } | null
}

// ─── Query Types ────────────────────────────────────────

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
}

export interface CreateMessagePayload {
  conversationId: string
  content?: string
  attachments?: {
    fileName?: string
    fileType?: string
    fileUrl: string
    thumbnailUrl?: string
    fileMimeType?: string
    key?: string
  }[]
}

// ─── API ────────────────────────────────────────────────

export const conversations = {
  getAll: (query?: PaginationQuery) =>
    api.get<ApiResponse<PaginatedResponse<ConversationItem>>>("/conversations", { params: query }),

  getById: (id: string) =>
    api.get<ApiResponse<ConversationDetail>>(`/conversations/${id}`),
}

export const messages = {
  getByConversation: (conversationId: string, query?: PaginationQuery) =>
    api.get<ApiResponse<PaginatedResponse<MessageItem>>>(`/messages/conversation/${conversationId}`, {
      params: query,
    }),

  getById: (id: string) =>
    api.get<ApiResponse<MessageItem>>(`/messages/${id}`),

  create: (payload: CreateMessagePayload) =>
    api.post<ApiResponse<MessageItem>>("/messages", payload),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<MessageItem>>(`/messages/${id}`, { isRead: true }),
}
