"use client"

import { messagesApi } from "@/api/conversations"
import { uploadOneImage } from "@/lib/upload"
import type { ContentMessage, MessageItem } from "@/lib/types"
import { useAuthStore } from "@/stores/auth-store"
import { useChatStore } from "@/stores/chat-store"
import type { MessageType } from "@workspace/database"
import { useCallback } from "react"
import { useMutation } from "@tanstack/react-query"

function getContentTypeFromFile(file: File): string {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  if (file.type.startsWith("audio/")) return "audio"
  return "file"
}

function buildFileContent(file: File, url: string): ContentMessage {
  const type = getContentTypeFromFile(file)
  return {
    type,
    url,
    thumbnailUrl: type === "video" ? url : undefined,
    name: file.name,
    size: file.size,
  }
}

function createTempId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `tmp_${crypto.randomUUID()}`
  }
  return `tmp_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
}

function resolveMessageType(content: ContentMessage): MessageType {
  const type = content.type?.toLowerCase()
  if (type === "text") return "text"
  if (type === "image") return "image"
  if (type === "video") return "video"
  if (type === "audio") return "audio"
  if (type === "file") return "file"
  if (content.text?.trim()) return "text"
  return "file"
}

export function useSendConversationMessage(conversationId: string) {
  const user = useAuthStore((s) => s.user)
  const appendPendingMessage = useChatStore((s) => s.appendPendingMessage)
  const replacePendingMessageId = useChatStore((s) => s.replacePendingMessageId)
  const updateMessageStatus = useChatStore((s) => s.updateMessageStatus)

  const sendMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files: File[] }) => {
      if (!conversationId) return

      const trimmedContent = content.trim()
      let firstError: unknown = null

      const sendPendingThenCreate = async (pendingContent: ContentMessage, finalContent: ContentMessage, cleanup?: () => void) => {
        const nowIso = new Date().toISOString()
        const tempId = createTempId()
        const optimisticMessage: MessageItem = {
          id: tempId,
          conversationId,
          senderType: "agent",
          accountCustomerId: null,
          quoteMessageId: pendingContent.quote_msg_id ?? null,
          content: pendingContent,
          status: "processing",
          externalId: null,
          isRead: true,
          timestamp: nowIso,
          type: resolveMessageType(pendingContent),
          createdBy: user?.id ?? null,
          isDeleted: false,
          createdAt: nowIso,
          updatedAt: nowIso,
          createdByUser: user
            ? {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              }
            : null,
          accountCustomer: null,
        }

        appendPendingMessage(conversationId, optimisticMessage)

        try {
          const res = await messagesApi.create({
            conversationId,
            content: finalContent,
          })
          if (!res.data) throw new Error("Không nhận được dữ liệu tin nhắn từ server")
          replacePendingMessageId(conversationId, tempId, res.data)
          cleanup?.()
        } catch (error) {
          updateMessageStatus(conversationId, tempId, "failed")
          if (!firstError) firstError = error
        }
      }

      if (trimmedContent) {
        const textContent: ContentMessage = { type: "text", text: trimmedContent }
        await sendPendingThenCreate(textContent, textContent)
      }

      for (const file of files) {
        const previewUrl = URL.createObjectURL(file)
        const pendingContent = buildFileContent(file, previewUrl)
        const nowIso = new Date().toISOString()
        const tempId = createTempId()
        const optimisticMessage: MessageItem = {
          id: tempId,
          conversationId,
          senderType: "agent",
          accountCustomerId: null,
          quoteMessageId: pendingContent.quote_msg_id ?? null,
          content: pendingContent,
          status: "processing",
          externalId: null,
          isRead: true,
          timestamp: nowIso,
          type: resolveMessageType(pendingContent),
          createdBy: user?.id ?? null,
          isDeleted: false,
          createdAt: nowIso,
          updatedAt: nowIso,
          createdByUser: user
            ? {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              }
            : null,
          accountCustomer: null,
        }

        appendPendingMessage(conversationId, optimisticMessage)

        try {
          const uploaded = await uploadOneImage({
            folder: `conversations/${conversationId}/messages`,
            file,
          })
          const finalContent = buildFileContent(file, uploaded.url)
          const res = await messagesApi.create({
            conversationId,
            content: finalContent,
          })
          if (!res.data) throw new Error("Không nhận được dữ liệu tin nhắn từ server")
          replacePendingMessageId(conversationId, tempId, res.data)
          URL.revokeObjectURL(previewUrl)
        } catch (error) {
          updateMessageStatus(conversationId, tempId, "failed")
          if (!firstError) firstError = error
        }
      }

      if (firstError) throw firstError
    },
  })

  const handleSendMessage = useCallback(
    async (content: string, files: File[] = []) => {
      if (!conversationId) return
      await sendMutation.mutateAsync({ content, files })
    },
    [conversationId, sendMutation]
  )

  return { handleSendMessage, isPending: sendMutation.isPending }
}
