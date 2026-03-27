"use client"

import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { getSenderName } from "@/lib/helper"
import type { MessageItem } from "@workspace/shared"
import { cn } from "@workspace/ui/lib/utils"
import { ImageGallery } from "./image-gallery"
import { MessageActions } from "./message-actions"

const getRenderableAttachment = (message: MessageItem) => {
  return (message.attachments ?? []).find((att) => !!(att.fileUrl || att.thumbnailUrl))
}

export function MessageImageRunGallery({ messages, showAvatar }: { messages: MessageItem[]; showAvatar: boolean }) {
  const first = messages[0]!
  const isCustomer = first.senderType === "customer"
  const senderName = getSenderName(first)
  const avatarUrl = isCustomer ? first.accountCustomer?.avatarUrl : first.user?.avatarUrl
  const images = messages
    .map((message) => {
      const att = getRenderableAttachment(message)
      if (!att) return null
      const src = att.fileUrl || att.thumbnailUrl || ""
      if (!src) return null
      return {
        id: message.id,
        src,
        alt: att.fileName?.trim() || message.content?.trim() || "attachment",
      }
    })
    .filter((item): item is { id: string; src: string; alt: string } => item !== null)

  if (images.length === 0) return null

  return (
    <div className={cn("group/msg flex max-w-[85%] gap-2.5", isCustomer ? "self-start" : "flex-row-reverse self-end")}>
      {showAvatar && isCustomer && (
        <div className="mt-1 shrink-0">
          <ConversationAvatar
            id={first.accountCustomerId || first.id}
            name={senderName}
            avatarUrl={avatarUrl}
            className="size-8"
          />
        </div>
      )}
      {!showAvatar && isCustomer && <div className="size-8 shrink-0" />}

      <div className={cn("relative flex flex-col gap-1", isCustomer ? "items-start" : "items-end")}>
        <span className={cn("text-xs text-muted-foreground", isCustomer ? "ml-1" : "mr-1")}>{senderName}</span>
        <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
          <div
            className={cn(
              "max-w-[75vw] overflow-hidden rounded-2xl border border-border sm:max-w-[420px]",
              isCustomer ? "rounded-tl-md" : "rounded-tr-md"
            )}
          >
            <ImageGallery images={images} />
          </div>
          <MessageActions isCustomer={isCustomer} content={first.content} />
        </div>
      </div>
    </div>
  )
}
