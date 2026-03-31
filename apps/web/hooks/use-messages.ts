"use client"

import { messages as messagesApi } from "@/api/conversations"
import { uploadManyImages } from "@/lib/upload"
import { useAuthStore } from "@/stores/auth-store"
import { useChatStore } from "@/stores/chat-store"
import type { MessageAttachment, MessageItem } from "@workspace/shared"
import { useCallback } from "react"
import { toast } from "@workspace/ui/components/sonner"

const OPTIMISTIC_PREFIX = "optimistic:"

function buildOptimisticAgentMessage(
  conversationId: string,
  content: string | null,
  tempId: string,
  attachments?: MessageItem["attachments"]
): MessageItem {
  const u = useAuthStore.getState().user
  const now = new Date().toISOString()
  return {
    id: tempId,
    conversationId,
    senderType: "agent",
    accountCustomerId: null,
    userId: u?.id ?? null,
    content: content || null,
    status: "processing",
    externalId: null,
    isRead: true,
    timestamp: now,
    createdAt: now,
    updatedAt: now,
    attachments,
    user: u ? { id: u.id, name: u.name, avatarUrl: u.avatarUrl ?? null } : null,
  }
}

export function useSendConversationMessage(conversationId: string) {
  const appendConversationMessages = useChatStore((s) => s.appendConversationMessages)
  const updateConversationMessageStatus = useChatStore((s) => s.updateConversationMessageStatus)
  const replaceMessage = useChatStore((s) => s.replaceMessage)

  const sendTextMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversationId) return
      const tempId = `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`
      const optimistic = buildOptimisticAgentMessage(conversationId, content, tempId)
      appendConversationMessages(conversationId, [optimistic])

      try {
        const res = await messagesApi.create({ conversationId, content })
        if (res.data) {
          replaceMessage(conversationId, tempId, {
            ...res.data,
            timestamp: optimistic.timestamp,
            createdAt: optimistic.createdAt,
          })
        } else {
          updateConversationMessageStatus(conversationId, tempId, "failed")
        }
      } catch (err: any) {
        updateConversationMessageStatus(conversationId, tempId, "failed")
        toast.error(err?.message ?? "Không thể gửi tin nhắn. Vui lòng thử lại.", { position: "bottom-right" })
      }
    },
    [conversationId, appendConversationMessages, replaceMessage, updateConversationMessageStatus]
  )

  const sendMessageWithFiles = useCallback(
    async (content: string, files: File[]) => {
      if (!conversationId || files.length === 0) return

      const hasText = !!content.trim()
      const baseTime = Date.now()

      const fileItems = files.map((file, index) => {
        const isImage = file.type.startsWith("image/")
        const blobUrl = isImage ? URL.createObjectURL(file) : null
        const tempId = `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`
        const ts = new Date(baseTime + index).toISOString()

        const att: MessageAttachment = {
          id: crypto.randomUUID(),
          messageId: tempId,
          fileName: file.name,
          fileType: isImage ? "image" : file.type,
          fileUrl: blobUrl,
          thumbnailUrl: blobUrl,
          fileMimeType: file.type,
          key: null,
          createdAt: ts,
        }

        const msg = buildOptimisticAgentMessage(conversationId, null, tempId, [att])
        msg.timestamp = ts
        msg.createdAt = ts
        return { tempId, file, blobUrl, optimistic: msg }
      })

      const allOptimistic = fileItems.map((item) => item.optimistic)
      appendConversationMessages(conversationId, allOptimistic)

      try {
        const uploadResults = await uploadManyImages({ folder: "uploads/photos", files })

        await Promise.all(
          fileItems.map(async ({ tempId, file, blobUrl, optimistic }, index) => {
            const upload = uploadResults[index]!
            try {
              const isImage = file.type.startsWith("image/")
              const res = await messagesApi.create({
                conversationId,
                attachments: [
                  {
                    fileName: file.name,
                    fileType: isImage ? "image" : file.type,
                    fileUrl: upload.url,
                    thumbnailUrl: upload.url,
                    fileMimeType: file.type,
                    key: upload.key,
                  },
                ],
              })
              if (res.data) {
                replaceMessage(conversationId, tempId, {
                  ...res.data,
                  timestamp: optimistic.timestamp,
                  createdAt: optimistic.createdAt,
                })
                if (blobUrl) URL.revokeObjectURL(blobUrl)
              } else {
                updateConversationMessageStatus(conversationId, tempId, "failed")
              }
            } catch {
              updateConversationMessageStatus(conversationId, tempId, "failed")
            }
          })
        )

        if (hasText) {
          await sendTextMessage(content)
        }
      } catch (err: any) {
        for (const { tempId } of fileItems) {
          updateConversationMessageStatus(conversationId, tempId, "failed")
        }
        toast.error(err?.message ?? "Upload thất bại. Vui lòng thử lại.", { position: "bottom-right" })
      }
    },
    [conversationId, appendConversationMessages, replaceMessage, updateConversationMessageStatus, sendTextMessage]
  )

  const handleSendMessage = useCallback(
    async (content: string, files: File[] = []) => {
      if (!conversationId) return

      const trimmedContent = content.trim()
      if (!trimmedContent && files.length === 0) return

      if (files.length > 0) {
        await sendMessageWithFiles(trimmedContent, files)
        return
      }

      await sendTextMessage(trimmedContent)
    },
    [conversationId, sendMessageWithFiles, sendTextMessage]
  )

  return { handleSendMessage, isPending: false }
}
