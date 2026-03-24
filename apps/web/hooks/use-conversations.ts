import { useCallback } from "react"
import { type InfiniteData, useQueryClient } from "@tanstack/react-query"
import type { ApiResponse, Conversation, PaginatedResponse } from "@workspace/shared"
import { useAppStore } from "@/stores/app-store"

type ConversationPage = ApiResponse<PaginatedResponse<Conversation>>

export function useConversations() {
  const queryClient = useQueryClient()

  const markAsRead = useCallback((conversationId: string) => {
    queryClient.setQueriesData<InfiniteData<ConversationPage>>(
      { queryKey: ["conversations", "list"] },
      (old) => {
        if (!old?.pages) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items:
                page.data?.items?.map((c) =>
                  c.id === conversationId ? { ...c, unreadCount: 0 } : c
                ) ?? [],
              meta: page.data!.meta,
            },
          })),
        }
      }
    )

    const { badges } = useAppStore.getState()
    const current = badges.conversationsUnreadCount ?? 0
    if (current > 0) {
      useAppStore.getState().setBadges({
        ...badges,
        conversationsUnreadCount: current - 1,
      })
    }
  }, [queryClient])

  return { markAsRead }
}
