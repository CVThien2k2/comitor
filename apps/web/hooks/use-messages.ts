"use client"

import { messagesApi } from "@/api/conversations"
import { uploadManyImages } from "@/lib/upload"
import { toast } from "@workspace/ui/components/sonner"
import { useCallback } from "react"

export function useSendConversationMessage(conversationId: string) {
  const sendTextMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversationId) return

      // Store đã tối giản, bỏ optimistic message/update status trong client store.
      // await messagesApi.create({ conversationId, content })
    },
    [conversationId]
  )

  const sendMessageWithFiles = useCallback(
    async (content: string, files: File[]) => {
      if (!conversationId || files.length === 0) return

      try {
        const uploadResults = await uploadManyImages({ folder: "uploads/photos", files })

        await Promise.all(
          files.map(async (file, index) => {
            const upload = uploadResults[index]!
            const isImage = file.type.startsWith("image/")

            // await messagesApi.create({
            //   conversationId,
            //   attachments: [
            //     {
            //       fileName: file.name,
            //       fileType: isImage ? "image" : file.type,
            //       fileUrl: upload.url,
            //       thumbnailUrl: upload.url,
            //       fileMimeType: file.type,
            //       key: upload.key,
            //     },
            //   ],
            // })
          })
        )

        if (content.trim()) {
          await sendTextMessage(content)
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Upload thất bại. Vui lòng thử lại.", { position: "bottom-right" })
      }
    },
    [conversationId, sendTextMessage]
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
