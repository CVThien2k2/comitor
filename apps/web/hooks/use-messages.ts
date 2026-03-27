"use client"

import { messages as messagesApi } from "@/api/conversations"
import { useAuthStore } from "@/stores/auth-store"
import { useChatStore } from "@/stores/chat-store"
import { useMutation } from "@tanstack/react-query"
import type { ApiResponse, MessageItem } from "@workspace/shared"
import { useCallback } from "react"

const OPTIMISTIC_PREFIX = "optimistic:"

function buildOptimisticAgentMessage(conversationId: string, content: string, tempId: string): MessageItem {
  const u = useAuthStore.getState().user
  const now = new Date().toISOString()
  return {
    id: tempId,
    conversationId,
    senderType: "agent",
    accountCustomerId: null,
    userId: u?.id ?? null,
    content,
    status: "processing",
    externalId: null,
    isRead: true,
    timestamp: now,
    createdAt: now,
    updatedAt: now,
    user: u ? { id: u.id, name: u.name, avatarUrl: u.avatarUrl ?? null } : null,
  }
}

type SendMessageContext = { tempId: string }

export function useSendConversationMessage(conversationId: string) {
  const appendConversationMessages = useChatStore((s) => s.appendConversationMessages)
  const updateConversationMessageStatus = useChatStore((s) => s.updateConversationMessageStatus)
  const replaceMessage = useChatStore((s) => s.replaceMessage)

  const { mutate, isPending } = useMutation<ApiResponse<MessageItem>, { message?: string }, string, SendMessageContext>(
    {
      mutationFn: (content: string) =>
        messagesApi.create({
          conversationId,
          content,
        }),
      onMutate: (content) => {
        const tempId = `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`
        const optimistic = buildOptimisticAgentMessage(conversationId, content, tempId)
        appendConversationMessages(conversationId, [optimistic])
        return { tempId }
      },
      onSuccess: (res, _content, context) => {
        const created = res.data
        const tempId = context?.tempId
        if (created && tempId) {
          const state = useChatStore.getState()
          const selectedMessage =
            state.selectedConversation?.id === conversationId
              ? state.selectedConversation.messages?.find((m) => m.id === tempId)
              : undefined
          const listMessage = state.conversations
            .find((c) => c.id === conversationId)
            ?.messages?.find((m) => m.id === tempId)
          const optimisticMessage = selectedMessage ?? listMessage

          const messageToReplace = optimisticMessage
            ? {
                ...created,
                timestamp: optimisticMessage.timestamp,
                createdAt: optimisticMessage.createdAt,
              }
            : created

          replaceMessage(conversationId, tempId, messageToReplace)
        } else if (created && !tempId) {
          appendConversationMessages(conversationId, [created])
        } else if (tempId) {
          updateConversationMessageStatus(conversationId, tempId, "failed")
        }
      },
      onError: (_err, _content, context) => {
        if (context?.tempId) updateConversationMessageStatus(conversationId, context.tempId, "failed")
      },
    }
  )

  const sendMessage = useCallback(
    (rawContent: string) => {
      const content = rawContent.trim()
      if (!content || isPending) return
      mutate(content)
    },
    [isPending, mutate]
  )

  return { sendMessage, isPending }
}
