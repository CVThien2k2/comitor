import { useCallback, useMemo } from "react"
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { messages as messagesApi } from "@/api/conversations"
import type { ApiResponse, CreateMessagePayload, MessageItem, PaginatedResponse } from "@workspace/shared"

type MessagePage = ApiResponse<PaginatedResponse<MessageItem>>
type MessageCache = InfiniteData<MessagePage>

// Áp dụng hàm cập nhật items cho toàn bộ các trang trong cache infinite-query.
function updatePageItems(
  old: MessageCache | undefined,
  updater: (items: MessageItem[]) => MessageItem[]
): MessageCache | undefined {
  if (!old?.pages) return old
  return {
    ...old,
    pages: old.pages.map(
      (page): MessagePage => ({
        ...page,
        data: {
          items: updater(page.data?.items ?? []),
          meta: page.data!.meta,
        },
      })
    ),
  }
}

// Thay thế message theo id trên tất cả các trang cache.
function replaceMessageById(
  old: MessageCache | undefined,
  targetId: string,
  replacer: (message: MessageItem) => MessageItem
): MessageCache | undefined {
  return updatePageItems(old, (items) => items.map((m) => (m.id === targetId ? replacer(m) : m)))
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => ["messages", "list", conversationId] as const, [conversationId])

  // Chèn message mới vào đầu trang đầu tiên (cache sắp xếp mới nhất trước).
  const addMessageToCache = useCallback(
    (message: MessageItem) => {
      queryClient.setQueriesData<MessageCache>({ queryKey }, (old) => {
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
      })
    },
    [queryClient, queryKey]
  )

  // Thay message tạm (optimistic) bằng message thật từ server.
  const replaceOptimisticMessage = useCallback(
    (messageId: string, serverMessage: MessageItem) => {
      queryClient.setQueriesData<MessageCache>({ queryKey }, (old) =>
        replaceMessageById(old, messageId, () => serverMessage)
      )
    },
    [queryClient, queryKey]
  )

  // Đánh dấu message tạm là failed khi gửi lỗi.
  const markMessageFailed = useCallback(
    (messageId: string) => {
      queryClient.setQueriesData<MessageCache>({ queryKey }, (old) =>
        replaceMessageById(old, messageId, (message) => ({ ...message, status: "failed" as const }))
      )
    },
    [queryClient, queryKey]
  )

  // Đánh dấu message đã gửi thành công (socket / xác nhận từ server).
  const markMessageSuccess = useCallback(
    (messageId: string) => {
      queryClient.setQueriesData<MessageCache>({ queryKey }, (old) =>
        replaceMessageById(old, messageId, (message) => ({ ...message, status: "success" as const }))
      )
    },
    [queryClient, queryKey]
  )

  const sendMessage = useMutation({
    mutationFn: (payload: CreateMessagePayload) => messagesApi.create(payload),
    onMutate: (payload) => {
      // Tạo message tạm để UI hiển thị ngay khi đang chờ API phản hồi.
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
      return { messageId: optimisticMessage.id }
    },
    onSuccess: (response, _payload, context) => {
      const serverMessage = response.data
      if (!serverMessage) return
      // Fallback: nếu thiếu optimistic context thì vẫn thêm message server vào cache.
      if (!context?.messageId) {
        addMessageToCache(serverMessage)
        return
      }

      replaceOptimisticMessage(context.messageId, serverMessage)
    },
    onError: (_error, _payload, context) => {
      if (!context) return
      markMessageFailed(context.messageId)
    },
  })

  return {
    sendMessage,
    addMessageToCache,
    replaceOptimisticMessage,
    markMessageFailed,
    markMessageSuccess,
  }
}
