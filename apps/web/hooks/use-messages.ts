import { useCallback } from "react"
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { messages as messagesApi } from "@/api/conversations"
import type { ApiResponse, CreateMessagePayload, MessageItem, PaginatedResponse } from "@workspace/shared"

type MessagePage = ApiResponse<PaginatedResponse<MessageItem>>
type MessageCache = InfiniteData<MessagePage>

function updatePageItems(
  old: MessageCache | undefined,
  updater: (items: MessageItem[]) => MessageItem[]
): MessageCache | undefined {
  if (!old?.pages) return old
  return {
    ...old,
    pages: old.pages.map((page): MessagePage => ({
      ...page,
      data: {
        items: updater(page.data?.items ?? []),
        meta: page.data!.meta,
      },
    })),
  }
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()

  const addMessageToCache = useCallback(
    (message: MessageItem) => {
      queryClient.setQueriesData<MessageCache>(
        { queryKey: ["messages", "list", conversationId] },
        (old) => {
          if (!old?.pages?.length) return old
          const firstPage = old.pages[0]
          if (!firstPage) return old
          const rest = old.pages.slice(1)
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: {
                  items: [message, ...(firstPage.data?.items ?? [])],
                  meta: firstPage.data!.meta,
                },
              } as MessagePage,
              ...rest,
            ],
          }
        }
      )
    },
    [queryClient, conversationId]
  )

  const sendMessage = useMutation({
    mutationFn: (payload: CreateMessagePayload) => messagesApi.create(payload),
    onMutate: (payload) => {
      const optimisticMessage: MessageItem = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderType: "agent",
        accountCustomerId: null,
        userId: null,
        content: payload.content ?? null,
        status: "processing",
        externalId: null,
        isRead: true,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addMessageToCache(optimisticMessage)
      return { optimisticId: optimisticMessage.id }
    },
    onSuccess: (response, _payload, context) => {
      const serverMessage = response.data
      if (!serverMessage || !context) return

      queryClient.setQueriesData<MessageCache>(
        { queryKey: ["messages", "list", conversationId] },
        (old) => updatePageItems(old, (items) =>
          items.map((m) => (m.id === context.optimisticId ? serverMessage : m))
        )
      )
    },
    onError: (_error, _payload, context) => {
      if (!context) return

      queryClient.setQueriesData<MessageCache>(
        { queryKey: ["messages", "list", conversationId] },
        (old) => updatePageItems(old, (items) =>
          items.map((m) => (m.id === context.optimisticId ? { ...m, status: "failed" as const } : m))
        )
      )
    },
  })

  return { sendMessage, addMessageToCache }
}
