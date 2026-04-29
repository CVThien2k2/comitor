import { api } from "@/lib/axios"
import type { ApiResponse, MessageItem, PaginatedResponse } from "@/lib/types"

export type { ConversationItem, MessageItem } from "@/lib/types"

// ─── Query Types ────────────────────────────────────────

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  cursorLastActivityAt?: string
  cursorId?: string
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
  items: any[]
  meta: ConversationListMeta
}

// ─── API ────────────────────────────────────────────────

export const conversations = {
  getAll: (query?: PaginationQuery & { unread?: boolean; myProcessing?: boolean }) =>
    api.get<ApiResponse<ConversationListResponse>>("/conversations", { params: query }),

  getUnreadCount: () => api.get<ApiResponse<number>>("/conversations/unread-count"),

  getById: (id: string) => api.get<ApiResponse<any>>(`/conversations/${id}`),

  markViewed: (id: string) => api.patch<ApiResponse<any>>(`/conversations/${id}/view`),

  markAsRead: (id: string) => api.patch<ApiResponse<number>>(`/conversations/${id}/mark-read`),
}

export const messagesApi = {
  getByConversation: (conversationId: string, query?: PaginationQuery) =>
    api.get<ApiResponse<PaginatedResponse<MessageItem>>>(`/messages/conversation/${conversationId}`, {
      params: query,
    }),

  getById: (id: string) => api.get<ApiResponse<MessageItem>>(`/messages/${id}`),

  create: (payload: any) => api.post<ApiResponse<MessageItem>>("/messages", payload),

  markAsRead: (id: string) => api.patch<ApiResponse<MessageItem>>(`/messages/${id}`, { isRead: true }),

  markAsUnread: (id: string) => api.patch<ApiResponse<MessageItem>>(`/messages/${id}`, { isRead: false }),
}
