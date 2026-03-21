import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import {
  conversations,
  messages,
  type PaginationQuery,
  type CreateMessagePayload,
} from "@/api/conversations"

const KEYS = {
  conversations: ["conversations"] as const,
  conversationList: (query?: PaginationQuery) => [...KEYS.conversations, "list", query] as const,
  conversationDetail: (id: string) => [...KEYS.conversations, "detail", id] as const,
  messages: ["messages"] as const,
  messageList: (conversationId: string) => [...KEYS.messages, "list", conversationId] as const,
}

// ─── Conversations ──────────────────────────────────────

export function useConversations(query?: PaginationQuery) {
  return useQuery({
    queryKey: KEYS.conversationList(query),
    queryFn: () => conversations.getAll(query),
    select: (res) => res.data,
  })
}

export function useConversationDetail(id: string | null) {
  return useQuery({
    queryKey: KEYS.conversationDetail(id!),
    queryFn: () => conversations.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  })
}

// ─── Messages (infinite scroll) ─────────────────────────

const MESSAGES_PER_PAGE = 30

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: KEYS.messageList(conversationId!),
    queryFn: ({ pageParam = 1 }) =>
      messages.getByConversation(conversationId!, { page: pageParam, limit: MESSAGES_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
    enabled: !!conversationId,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      messages: data.pages.flatMap((page) => page.data?.items ?? []),
      total: data.pages[0]?.data?.meta.total ?? 0,
    }),
  })
}

// ─── Mutations ──────────────────────────────────────────

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMessagePayload) => messages.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: KEYS.messageList(variables.conversationId) })
      qc.invalidateQueries({ queryKey: KEYS.conversations })
    },
  })
}

export function useMarkMessageAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => messages.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.conversations })
    },
  })
}
