"use client"

import { useMemo } from "react"
import { Icons } from "@/components/global/icons"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { cn } from "@workspace/ui/lib/utils"
import type { MessageItem } from "@/api/conversations"
import { getSenderName } from "@/lib/helper"
import { ImageGallery } from "./image-gallery"
import { MessageActions } from "./message-actions"

const isImageAttachment = (att: NonNullable<MessageItem["attachments"]>[number]) => {
  const mime = att.fileMimeType?.toLowerCase() ?? ""
  if (mime.startsWith("image/")) return true

  const type = att.fileType?.toLowerCase() ?? ""
  if (type === "image") return true

  const source = `${att.fileUrl ?? ""} ${att.thumbnailUrl ?? ""} ${att.fileName ?? ""}`.toLowerCase()
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/.test(source)
}

// ─── Message Bubble ─────────────────────────────────────

export function MessageBubble({ message, showAvatar = true }: { message: MessageItem; showAvatar?: boolean }) {
  const isCustomer = message.senderType === "customer"
  const senderName = getSenderName(message)
  const avatarUrl = isCustomer ? message.accountCustomer?.avatarUrl : message.user?.avatarUrl
  const contentText =
    message && "content" in message && typeof message.content === "string" ? message.content.trim() : ""

  const renderableAttachments = useMemo(() => {
    return (message.attachments ?? []).filter((att) => !!(att.fileUrl || att.thumbnailUrl))
  }, [message.attachments])

  const imageAttachments = useMemo(() => {
    return renderableAttachments.filter(isImageAttachment)
  }, [renderableAttachments])

  const nonImageAttachments = useMemo(() => {
    return renderableAttachments.filter((att) => !isImageAttachment(att))
  }, [renderableAttachments])

  const hasImageGrid = imageAttachments.length > 1
  const attachment = hasImageGrid ? null : renderableAttachments[0] ?? null
  const attachmentUrl = attachment?.fileUrl || attachment?.thumbnailUrl || ""
  const attachmentName = attachment?.fileName?.trim() || contentText || "Tệp đính kèm"
  const isImage = !!attachment && isImageAttachment(attachment)
  const hasAttachment = !!attachment && !!attachmentUrl
  const hasAnyAttachment = renderableAttachments.length > 0
  const hasText = !!contentText && !hasAnyAttachment

  return (
    <div className={cn("group/msg flex max-w-[85%] gap-2.5", isCustomer ? "self-start" : "flex-row-reverse self-end")}>
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

        {/* Multiple image attachments: grid layout */}
        {hasImageGrid && (
          <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
            <div
              className={cn(
                "max-w-[75vw] overflow-hidden rounded-2xl border border-border sm:max-w-[420px]",
                isCustomer ? "rounded-tl-md" : "rounded-tr-md"
              )}
            >
              <ImageGallery
                images={imageAttachments.map((att) => ({
                  id: att.id,
                  src: att.fileUrl || att.thumbnailUrl || "",
                  alt: att.fileName?.trim() || contentText || "attachment",
                }))}
              />
            </div>
            {!hasText && <MessageActions isCustomer={isCustomer} content={message.content} />}
          </div>
        )}

        {/* Non-image attachments when image grid is shown */}
        {hasImageGrid &&
          nonImageAttachments.map((att) => (
            <div
              key={att.id}
              className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}
            >
              <div
                className={cn(
                  "max-w-[320px] min-w-[220px] overflow-hidden rounded-2xl border border-border",
                  isCustomer ? "rounded-tl-md" : "rounded-tr-md"
                )}
              >
                <a
                  href={att.fileUrl || att.thumbnailUrl || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icons.paperclip className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{att.fileName?.trim() || "Tệp đính kèm"}</p>
                    <p className="text-[11px] text-muted-foreground">Tệp đính kèm</p>
                  </div>
                </a>
              </div>
            </div>
          ))}

        {/* Single image attachment */}
        {!hasImageGrid && hasAttachment && isImage && (
          <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
            <div
              className={cn(
                "max-w-[75vw] overflow-hidden rounded-2xl border border-border sm:max-w-[420px]",
                isCustomer ? "rounded-tl-md" : "rounded-tr-md"
              )}
            >
              <img
                src={attachmentUrl}
                alt={attachmentName}
                className="h-[220px] w-full object-cover sm:h-[260px]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              {(attachment?.fileName || contentText) && (
                <div className="border-t border-border/60 bg-background/90 px-3 py-2 text-xs text-muted-foreground">
                  {attachmentName}
                </div>
              )}
            </div>
            {!hasText && <MessageActions isCustomer={isCustomer} content={message.content} />}
          </div>
        )}

        {/* Single non-image attachment */}
        {!hasImageGrid && hasAttachment && !isImage && (
          <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
            <div
              className={cn(
                "max-w-[320px] min-w-[220px] overflow-hidden rounded-2xl border border-border",
                isCustomer ? "rounded-tl-md" : "rounded-tr-md"
              )}
            >
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icons.paperclip className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{attachmentName}</p>
                  <p className="text-[11px] text-muted-foreground">Tệp đính kèm</p>
                </div>
              </a>
            </div>
            {!hasText && <MessageActions isCustomer={isCustomer} content={message.content} />}
          </div>
        )}

        {/* Tin nhắn text thuần (không có attachment) */}
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
              {message.content}
            </div>
            <MessageActions isCustomer={isCustomer} content={message.content} />
          </div>
        )}

        {/* Fallback when no text and no attachment */}
        {!hasText && !hasAnyAttachment && (
          <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                isCustomer ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
                isCustomer ? "rounded-tl-md" : "rounded-tr-md",
                message.status === "failed" && "border border-red-500/70"
              )}
            >
              [Tệp đính kèm]
            </div>
            <MessageActions isCustomer={isCustomer} content={message.content} />
          </div>
        )}

        {!isCustomer && (
          <div
            className={cn(
              "flex items-center gap-1 px-1 text-[10px] font-medium",
              message.status === "processing" && "text-amber-600",
              message.status === "success" && "text-emerald-600",
              message.status === "failed" && "text-red-600"
            )}
          >
            {message.status === "processing" && <Icons.spinner className="size-3 animate-spin" />}
            {message.status === "success" && <Icons.checkCheck className="size-3" />}
            {message.status === "failed" && <Icons.xCircle className="size-3" />}
            {message.status === "processing" && "Đang gửi"}
            {message.status === "success" && "Đã gửi"}
            {message.status === "failed" && "Lỗi"}
          </div>
        )}
      </div>
    </div>
  )
}
