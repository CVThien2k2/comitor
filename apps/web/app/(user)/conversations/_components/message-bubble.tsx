"use client"

import { Icons } from "@/components/global/icons"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { cn } from "@workspace/ui/lib/utils"
import type { MessageItem } from "@/api/conversations"
import { getSenderName } from "@/lib/helper"
import { MessageActions } from "./message-actions"

function getMessageTextContent(content: MessageItem["content"]): string {
  if (!content) return ""
  if (typeof content === "string") return content.trim()
  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text?.trim())
      .filter((text): text is string => !!text)
      .join(" ")
      .trim()
  }
  return content.text?.trim() ?? ""
}

// ─── Message Bubble ─────────────────────────────────────

export function MessageBubble({
  message,
  showAvatar = true,
  elementId,
}: {
  message: MessageItem
  showAvatar?: boolean
  elementId?: string
}) {
  const isCustomer = message.senderType === "customer"
  const senderName = getSenderName(message)
  const avatarUrl = isCustomer ? message.accountCustomer?.avatarUrl : message.createdByUser?.avatarUrl
  const contentText = getMessageTextContent(message.content)
  const hasText = !!contentText

  return (
    <div
      id={elementId}
      className={cn("group/msg flex max-w-[85%] gap-2.5", isCustomer ? "self-start" : "flex-row-reverse self-end")}
    >
      {showAvatar && isCustomer && (
        <div className="mt-1 shrink-0">
          <ConversationAvatar
            id={message.accountCustomerId || message.id}
            name={senderName}
            avatarUrl={avatarUrl}
            className="size-8"
          />
        </div>
      )}
      {!showAvatar && isCustomer && <div className="size-8 shrink-0" />}

      <div className={cn("relative flex flex-col gap-1", isCustomer ? "items-start" : "items-end")}>
        <span className={cn("text-xs text-muted-foreground", isCustomer ? "ml-1" : "mr-1")}>{senderName}</span>

        {hasText && (
          <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed wrap-break-word",
                isCustomer ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
                isCustomer ? "rounded-tl-md" : "rounded-tr-md",
                message.status === "failed" && "border border-red-500/70"
              )}
            >
              {contentText}
            </div>
            <MessageActions isCustomer={isCustomer} content={message.content} />
          </div>
        )}

        {!hasText && (
          <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                isCustomer ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
                isCustomer ? "rounded-tl-md" : "rounded-tr-md",
                message.status === "failed" && "border border-red-500/70"
              )}
            >
              [Tin nhắn trống]
            </div>
            <MessageActions isCustomer={isCustomer} content={message.content} />
          </div>
        )}

        {(message.status === "processing" || message.status === "failed") && (
          <div
            className={cn(
              "flex items-center gap-1 px-1 text-[10px] font-medium",
              message.status === "processing" && "text-amber-600",
              message.status === "failed" && "text-red-600"
            )}
          >
            {message.status === "processing" && <Icons.spinner className="size-3 animate-spin" />}
            {message.status === "failed" && <Icons.xCircle className="size-3" />}
            {message.status === "processing" && "Đang gửi"}
            {message.status === "failed" && "Lỗi"}
          </div>
        )}
      </div>
    </div>
  )
}
