import { api } from "@/lib/axios"
import type { ApiResponse, ConversationItem, MessageItem } from "@/lib/types"

export type { ConversationItem, MessageItem } from "@/lib/types"

// ─── Query Types ────────────────────────────────────────

export interface ConversationListQuery {
  limit?: number
  search?: string
  cursorLastActivityAt?: string
  cursorId?: string
  unread?: boolean
  myProcessing?: boolean
}

export interface ConversationListCursor {
  lastActivityAt: string
  id: string
}

export interface ConversationListMeta {
  limit: number
  total: number
  hasMore: boolean
  nextCursor: ConversationListCursor | null
}

export interface ConversationListResponse {
  items: ConversationItem[]
  meta: ConversationListMeta
}

export type MessageCursorDirection = "older" | "newer"

export interface MessageCursor {
  time: string
  id: string
}

export interface MessageCursorQuery {
  limit?: number
  cursorTime?: string
  cursorId?: string
  direction?: MessageCursorDirection
}

export interface MessageCursorMeta {
  limit: number
  hasMore: boolean
  direction: MessageCursorDirection
  nextCursor: MessageCursor | null
}

export interface MessageCursorResponse {
  items: MessageItem[]
  meta: MessageCursorMeta
}

export interface MessageSearchQuery {
  q: string
  limit?: number
  cursorTime?: string
  cursorId?: string
}

export interface MessageSearchItem {
  id: string
  conversationId: string
  createdAt: string
  timestamp: string
  snippet: string
  rank: number
}

export interface MessageSearchResponse {
  items: MessageSearchItem[]
  meta: {
    limit: number
    hasMore: boolean
    nextCursor: MessageCursor | null
  }
}

export interface MessageAroundResponse {
  items: MessageItem[]
  meta: {
    before: number
    after: number
    hasMoreOlder: boolean
    hasMoreNewer: boolean
    olderCursor: MessageCursor | null
    newerCursor: MessageCursor | null
  }
}

type CreateMessagePayload = {
  conversationId: string
  content?: string
  attachments?: Array<{
    fileName?: string
    fileType?: string
    fileUrl: string
    thumbnailUrl?: string
    fileMimeType?: string
    key?: string
  }>
}

// ─── API ────────────────────────────────────────────────

export const conversations = {
  getAll: (query?: ConversationListQuery) =>
    api.get<ApiResponse<ConversationListResponse>>("/conversations", { params: query }),

  getUnreadCount: () => api.get<ApiResponse<number>>("/conversations/unread-count"),

  getById: (id: string) => api.get<ApiResponse<ConversationItem>>(`/conversations/${id}`),

  markViewed: (id: string) => api.patch<ApiResponse<ConversationItem>>(`/conversations/${id}/view`),

  markAsRead: (id: string) => api.patch<ApiResponse<number>>(`/conversations/${id}/mark-read`),
}

export const messagesApi = {
  getByConversation: (conversationId: string, query?: MessageCursorQuery) =>
    api.get<ApiResponse<MessageCursorResponse>>(`/messages/conversation/${conversationId}`, {
      params: query,
    }),

  getAroundMessage: (conversationId: string, messageId: string, query?: { before?: number; after?: number }) =>
    api.get<ApiResponse<MessageAroundResponse>>(`/messages/conversation/${conversationId}/around/${messageId}`, {
      params: query,
    }),

  searchInConversation: (conversationId: string, query: MessageSearchQuery) =>
    api.get<ApiResponse<MessageSearchResponse>>(`/messages/conversation/${conversationId}/search`, {
      params: query,
    }),

  getById: (id: string) => api.get<ApiResponse<MessageItem>>(`/messages/${id}`),

  create: (payload: CreateMessagePayload) => api.post<ApiResponse<MessageItem>>("/messages", payload),

  markAsRead: (id: string) => api.patch<ApiResponse<MessageItem>>(`/messages/${id}`, { isRead: true }),

  markAsUnread: (id: string) => api.patch<ApiResponse<MessageItem>>(`/messages/${id}`, { isRead: false }),
}
