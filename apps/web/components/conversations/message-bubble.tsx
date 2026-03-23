"use client"

import { Icons } from "@/components/global/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import type { MessageItem } from "@/api/conversations"
import {
  getInitials,
  getSenderName,
  getAvatarColor,
  formatMessageTime,
} from "@/lib/helper"
import { ImageGallery } from "./image-gallery"

// ─── PDF Preview ────────────────────────────────────────

function MessagePdf({ src, name }: { src: string; name: string }) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
    >
      <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
        <Icons.fileText className="size-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">PDF</p>
      </div>
    </a>
  )
}

// ─── Message Bubble ─────────────────────────────────────

export function MessageBubble({
  message,
  showAvatar = true,
  conversationAvatarColor,
}: {
  message: MessageItem
  showAvatar?: boolean
  conversationAvatarColor: string
}) {
  const isCustomer = message.senderType === "customer"
  const senderName = getSenderName(message)
  const initials = getInitials(senderName)
  const avatarUrl = isCustomer
    ? message.accountCustomer?.avatarUrl
    : message.user?.avatarUrl
  const avatarColor = isCustomer
    ? conversationAvatarColor
    : getAvatarColor(message.userId || message.id)

  const imageAtts = message.attachments.filter(
    (att) => att.fileMimeType?.startsWith("image/") && att.fileUrl
  )
  const pdfAtts = message.attachments.filter(
    (att) => att.fileMimeType === "application/pdf" && att.fileUrl
  )
  const fileAtts = message.attachments.filter(
    (att) =>
      att.fileUrl &&
      !att.fileMimeType?.startsWith("image/") &&
      att.fileMimeType !== "application/pdf"
  )
  const hasMedia = imageAtts.length > 0 || pdfAtts.length > 0
  const hasText = !!message.content
  const bubbleRound = isCustomer ? "rounded-tl-md" : "rounded-tr-md"
  const textBg = isCustomer
    ? "bg-muted text-foreground"
    : "bg-primary text-primary-foreground"

  return (
    <div
      className={cn(
        "flex gap-2.5 max-w-[85%]",
        isCustomer ? "self-start" : "self-end flex-row-reverse"
      )}
    >
      {showAvatar && isCustomer && (
        <Avatar className="size-8 shrink-0 mt-1">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && isCustomer && <div className="size-8 shrink-0" />}

      <div className={cn("flex flex-col gap-1", isCustomer ? "items-start" : "items-end")}>
        {showAvatar && (
          <span className="text-xs text-muted-foreground ml-1">{senderName}</span>
        )}

        {/* Image + text in one bubble */}
        {imageAtts.length > 0 && (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-border max-w-[200px]",
              bubbleRound
            )}
          >
            <ImageGallery images={imageAtts.map((att) => ({ id: att.id, src: att.fileUrl!, alt: att.fileName || "attachment" }))} />
            {hasText && !pdfAtts.length && (
              <div className={cn("px-3 py-2 text-sm leading-relaxed", textBg)}>
                {message.content}
              </div>
            )}
          </div>
        )}

        {/* PDF + text in one bubble */}
        {pdfAtts.length > 0 && (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-border max-w-[200px]",
              bubbleRound
            )}
          >
            {pdfAtts.map((att) => (
              <MessagePdf
                key={att.id}
                src={att.fileUrl!}
                name={att.fileName || "document.pdf"}
              />
            ))}
            {hasText && (
              <div className={cn("px-3 py-2 text-sm leading-relaxed border-t border-border", textBg)}>
                {message.content}
              </div>
            )}
          </div>
        )}

        {/* Text-only bubble (no media) */}
        {!hasMedia && (
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
              textBg,
              bubbleRound
            )}
          >
            {message.content || "[Tệp đính kèm]"}
          </div>
        )}

        {/* Other file attachments */}
        {fileAtts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {fileAtts.map((att) => (
              <a
                key={att.id}
                href={att.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border hover:bg-muted/80 text-sm"
              >
                <Icons.paperclip className="size-4" />
                <span className="truncate max-w-[160px]">
                  {att.fileName || "Tệp đính kèm"}
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(message.createdAt)}
          </span>
          {message.senderType === "agent" && (
            <span className="text-[10px] text-muted-foreground">
              {message.status === "processing" && "Đang gửi..."}
              {message.status === "failed" && "Gửi thất bại"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
