import { type InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useChatStore } from "@/stores/chat-store"
import { useAppStore } from "@/stores/app-store"
import { useAuthStore } from "@/stores/auth-store"
import { conversations as conversationsApi, messages as messagesApi, type Conversation, type MessageItem } from "@/api/conversations"
import { patchConversationLatestMessageReadState } from "@/lib/conversation-read-state"
import type { ApiResponse, PaginatedResponse } from "@workspace/shared"

type ConversationLastViewedData = {
  lastViewedById: string | null
  lastViewedAt: string | null
  lastViewedBy: Conversation["lastViewedBy"] | null
}

function patchConversationLastViewed(conversation: Conversation, payload: ConversationLastViewedData): Conversation {
  return {
    ...conversation,
    lastViewedById: payload.lastViewedById,
    lastViewedAt: payload.lastViewedAt,
    lastViewedBy: payload.lastViewedBy,
  }
}

export function useConversations() {
  const queryClient = useQueryClient()

  const syncUnreadBadgeCount = useCallback((previousUnreadCount: number, nextUnreadCount: number) => {
    if (previousUnreadCount === 0 && nextUnreadCount > 0) {
      useAppStore.getState().incrementConversationsUnreadCount(1)
    }

    if (previousUnreadCount > 0 && nextUnreadCount === 0) {
      useAppStore.getState().decrementConversationsUnreadCount(1)
    }
  }, [])

  const syncConversationCaches = useCallback(
    (conversationId: string, messageId: string, nextIsRead: boolean) => {
      queryClient.setQueryData<ApiResponse<Conversation>>(["conversations", "detail", conversationId], (old) => {
        if (!old?.data) return old

        return {
          ...old,
          data: patchConversationLatestMessageReadState(old.data, messageId, nextIsRead),
        }
      })

      queryClient.setQueriesData<InfiniteData<ApiResponse<PaginatedResponse<Conversation>>>>(
        { queryKey: ["conversations", "list"] },
        (old) => {
          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    items: page.data.items.map((conversation) =>
                      conversation.id === conversationId
                        ? patchConversationLatestMessageReadState(conversation, messageId, nextIsRead)
                        : conversation
                    ),
                  }
                : page.data,
            })),
          }
        }
      )

      queryClient.setQueriesData<InfiniteData<ApiResponse<PaginatedResponse<MessageItem>>>>(
        { queryKey: ["messages", "list", conversationId] },
        (old) => {
          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    items: page.data.items.map((message) =>
                      message.id === messageId ? { ...message, isRead: nextIsRead } : message
                    ),
                  }
                : page.data,
            })),
          }
        }
      )
    },
    [queryClient]
  )

  const syncConversationViewCaches = useCallback(
    (conversationId: string, payload: ConversationLastViewedData) => {
      queryClient.setQueryData<ApiResponse<Conversation>>(["conversations", "detail", conversationId], (old) => {
        if (!old?.data) return old

        return {
          ...old,
          data: patchConversationLastViewed(old.data, payload),
        }
      })

      queryClient.setQueriesData<InfiniteData<ApiResponse<PaginatedResponse<Conversation>>>>(
        { queryKey: ["conversations", "list"] },
        (old) => {
          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    items: page.data.items.map((conversation) =>
                      conversation.id === conversationId
                        ? patchConversationLastViewed(conversation, payload)
                        : conversation
                    ),
                  }
                : page.data,
            })),
          }
        }
      )
    },
    [queryClient]
  )

  const invalidateConversationQueries = useCallback(
    (conversationId: string) => {
      void queryClient.invalidateQueries({ queryKey: ["conversations", "list"] })
      void queryClient.invalidateQueries({ queryKey: ["conversations", "detail", conversationId] })
      void queryClient.invalidateQueries({ queryKey: ["messages", "list", conversationId] })
      void queryClient.invalidateQueries({ queryKey: ["app", "init"] })
    },
    [queryClient]
  )

  const markAsRead = useCallback((conversationId: string) => {
    const { wasUnread, hasUnreadInState, latestMessageId } = useChatStore.getState().markAsRead(conversationId)

    if (latestMessageId) {
      syncConversationCaches(conversationId, latestMessageId, true)
    }

    // Server cần đồng bộ nếu trước đó hoặc hiện tại state còn unread thật sự.
    if (wasUnread || hasUnreadInState) {
      // Patch local state trước để UI phản hồi ngay; gọi API server để đồng bộ trạng thái.
      void conversationsApi
        .markAsRead(conversationId)
        .then(() => {
          invalidateConversationQueries(conversationId)
        })
        .catch(() => {
          // Không block UI nếu call API thất bại.
        })
    }

    if (wasUnread) useAppStore.getState().decrementConversationsUnreadCount(1)
  }, [invalidateConversationQueries, syncConversationCaches])

  const markAsViewed = useCallback(
    async (conversationId: string) => {
      const chatState = useChatStore.getState()
      const currentConversation =
        chatState.selectedConversation?.id === conversationId
          ? chatState.selectedConversation
          : chatState.conversations.find((conversation) => conversation.id === conversationId) ?? null

      const previousLastViewed: ConversationLastViewedData = {
        lastViewedById: currentConversation?.lastViewedById ?? null,
        lastViewedAt: currentConversation?.lastViewedAt ?? null,
        lastViewedBy: currentConversation?.lastViewedBy ?? null,
      }

      const currentUser = useAuthStore.getState().user
      const optimisticLastViewed: ConversationLastViewedData = {
        lastViewedById: currentUser?.id ?? previousLastViewed.lastViewedById,
        lastViewedAt: new Date().toISOString(),
        lastViewedBy: currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl ?? null,
            }
          : previousLastViewed.lastViewedBy,
      }

      useChatStore.getState().setConversationLastViewed({ conversationId, ...optimisticLastViewed })
      syncConversationViewCaches(conversationId, optimisticLastViewed)

      try {
        const response = await conversationsApi.markViewed(conversationId)
        if (!response.data) return response

        useChatStore.getState().hydrateConversation(response.data)
        syncConversationViewCaches(conversationId, {
          lastViewedById: response.data.lastViewedById,
          lastViewedAt: response.data.lastViewedAt,
          lastViewedBy: response.data.lastViewedBy ?? null,
        })
        queryClient.setQueryData<ApiResponse<Conversation>>(["conversations", "detail", conversationId], response)

        return response
      } catch (error) {
        useChatStore.getState().setConversationLastViewed({ conversationId, ...previousLastViewed })
        syncConversationViewCaches(conversationId, previousLastViewed)
        void queryClient.invalidateQueries({ queryKey: ["conversations", "detail", conversationId] })
        return Promise.reject(error)
      }
    },
    [queryClient, syncConversationViewCaches]
  )

  const setMessageReadState = useCallback(
    async (conversationId: string, messageId: string, nextIsRead: boolean, fallbackPreviousIsRead: boolean) => {
      const { previousUnreadCount, nextUnreadCount, didUpdate } = useChatStore
        .getState()
        .setMessageReadState(conversationId, messageId, nextIsRead, fallbackPreviousIsRead)
      if (!didUpdate) return { previousUnreadCount, nextUnreadCount, didUpdate: false }

      syncConversationCaches(conversationId, messageId, nextIsRead)
      syncUnreadBadgeCount(previousUnreadCount, nextUnreadCount)

      try {
        if (nextIsRead) {
          await messagesApi.markAsRead(messageId)
        } else {
          await messagesApi.markAsUnread(messageId)
        }
      } catch {
        useChatStore.getState().setMessageReadState(conversationId, messageId, fallbackPreviousIsRead, nextIsRead)
        useChatStore.getState().clearPendingConversationReadOverride(conversationId, messageId)
        syncConversationCaches(conversationId, messageId, fallbackPreviousIsRead)
        syncUnreadBadgeCount(nextUnreadCount, previousUnreadCount)

        return { previousUnreadCount, nextUnreadCount: previousUnreadCount, didUpdate: false }
      }

      useChatStore.getState().clearPendingConversationReadOverride(conversationId, messageId)
      invalidateConversationQueries(conversationId)

      return { previousUnreadCount, nextUnreadCount, didUpdate: true }
    },
    [invalidateConversationQueries, syncConversationCaches, syncUnreadBadgeCount]
  )

  return { markAsRead, markAsViewed, setMessageReadState }
}
