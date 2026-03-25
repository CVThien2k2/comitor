import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Conversation, MessageItem, CreateMessagePayload } from "@workspace/shared"

export type { Conversation, MessageItem, MessageAttachment, CreateMessagePayload } from "@workspace/shared"

// ─── Query Types ────────────────────────────────────────

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
}

// ─── API ────────────────────────────────────────────────

export const conversations = {
  getAll: (query?: PaginationQuery & { unread?: boolean }) =>
    api.get<ApiResponse<PaginatedResponse<Conversation>>>("/conversations", { params: query }),

  getUnreadCount: () => api.get<ApiResponse<number>>("/conversations/unread-count"),

  getById: (id: string) => api.get<ApiResponse<Conversation>>(`/conversations/${id}`),

  markAsRead: (id: string) => api.patch<ApiResponse<number>>(`/conversations/${id}/mark-read`),
}

export const messages = {
  getByConversation: (conversationId: string, query?: PaginationQuery) =>
    api.get<ApiResponse<PaginatedResponse<MessageItem>>>(`/messages/conversation/${conversationId}`, {
      params: query,
    }),

  getById: (id: string) => api.get<ApiResponse<MessageItem>>(`/messages/${id}`),

  create: (payload: CreateMessagePayload) => api.post<ApiResponse<MessageItem>>("/messages", payload),

  markAsRead: (id: string) => api.patch<ApiResponse<MessageItem>>(`/messages/${id}`, { isRead: true }),
}
