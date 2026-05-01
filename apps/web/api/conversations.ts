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

export interface MessageCursor {
  time: string
  id: string
}

export interface MessageCursorQuery {
  limit?: number
  cursorTime?: string
  cursorId?: string
}

export interface MessageCursorMeta {
  limit: number
  hasMore: boolean
  nextCursor: MessageCursor | null
}

export interface MessageCursorResponse {
  items: MessageItem[]
  meta: MessageCursorMeta
}
 

// ─── API ────────────────────────────────────────────────

export const conversations = {
  getAll: (query?: ConversationListQuery) =>
    api.get<ApiResponse<ConversationListResponse>>("/conversations", { params: query }),
  getById: (id: string) => api.get<ApiResponse<ConversationItem>>(`/conversations/${id}`),
}

export const messagesApi = {
  getByConversation: (conversationId: string, query?: MessageCursorQuery) =>
    api.get<ApiResponse<MessageCursorResponse>>(`/messages/conversation/${conversationId}`, {
      params: query,
    }),
  getById: (id: string) => api.get<ApiResponse<MessageItem>>(`/messages/${id}`),
}
