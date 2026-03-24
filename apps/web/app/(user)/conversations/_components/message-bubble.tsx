"use client"

import { useMemo } from "react"
import { Icons } from "@/components/global/icons"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { cn } from "@workspace/ui/lib/utils"
import type { MessageItem } from "@/api/conversations"
import { getSenderName, formatMessageTime } from "@/lib/helper"
import { ImageGallery } from "./image-gallery"

// ─── PDF Preview ────────────────────────────────────────

function MessagePdf({ src, name }: { src: string; name: string }) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
        <Icons.fileText className="size-5 text-red-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-[11px] text-muted-foreground">PDF</p>
      </div>
    </a>
  )
}

// ─── Message Bubble ─────────────────────────────────────

export function MessageBubble({ message, showAvatar = true }: { message: MessageItem; showAvatar?: boolean }) {
  const isCustomer = message.senderType === "customer"
  const senderName = getSenderName(message)
  const avatarUrl = isCustomer ? message.accountCustomer?.avatarUrl : message.user?.avatarUrl

  const { imageAtts, pdfAtts, fileAtts } = useMemo(() => {
    const grouped = {
      imageAtts: [] as NonNullable<MessageItem["attachments"]>,
      pdfAtts: [] as NonNullable<MessageItem["attachments"]>,
      fileAtts: [] as NonNullable<MessageItem["attachments"]>,
    }

    for (const att of message.attachments ?? []) {
      if (!att.fileUrl) continue

      if (att.fileMimeType?.startsWith("image/")) {
        grouped.imageAtts.push(att)
        continue
      }

      if (att.fileMimeType === "application/pdf") {
        grouped.pdfAtts.push(att)
        continue
      }

      grouped.fileAtts.push(att)
    }

    return grouped
  }, [message.attachments])

  const hasMedia = imageAtts.length > 0 || pdfAtts.length > 0
  const hasText = !!message.content
  const bubbleRound = isCustomer ? "rounded-tl-md" : "rounded-tr-md"
  const textBg = isCustomer ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"

  return (
    <div className={cn("flex max-w-[85%] gap-2.5", isCustomer ? "self-start" : "flex-row-reverse self-end")}>
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

      <div className={cn("flex flex-col gap-1", isCustomer ? "items-start" : "items-end")}>
        {showAvatar && <span className="ml-1 text-xs text-muted-foreground">{senderName}</span>}

        {/* Images */}
        {imageAtts.length > 0 && (
          <div
            className={cn(
              "max-w-[75vw] overflow-hidden rounded-2xl border border-border sm:max-w-[420px]",
              bubbleRound
            )}
          >
            <ImageGallery
              images={imageAtts.map((att) => ({ id: att.id, src: att.fileUrl!, alt: att.fileName || "attachment" }))}
            />
          </div>
        )}

        {/* PDFs */}
        {pdfAtts.length > 0 && (
          <div
            className={cn("max-w-[320px] min-w-[220px] overflow-hidden rounded-2xl border border-border", bubbleRound)}
          >
            {pdfAtts.map((att) => (
              <MessagePdf key={att.id} src={att.fileUrl!} name={att.fileName || "document.pdf"} />
            ))}
          </div>
        )}

        {/* Text bubble */}
        {hasText && (
          <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed wrap-break-word", textBg, bubbleRound)}>
            {message.content}
          </div>
        )}

        {/* Fallback when no text and no media */}
        {!hasText && !hasMedia && (
          <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed", textBg, bubbleRound)}>
            [Tệp đính kèm]
          </div>
        )}

        {/* Other file attachments */}
        {fileAtts.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {fileAtts.map((att) => (
              <a
                key={att.id}
                href={att.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm hover:bg-muted/80"
              >
                <Icons.paperclip className="size-4" />
                <span className="max-w-[160px] truncate">{att.fileName || "Tệp đính kèm"}</span>
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground">{formatMessageTime(message.createdAt)}</span>
          {message.senderType === "agent" && (
            <span className="text-[10px] text-muted-foreground">
              {message.status === "processing" && "Đang gửi"}
              {message.status === "failed" && "Gửi thất bại"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
