"use client"

import { Icons } from "@/components/global/icons"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { cn } from "@workspace/ui/lib/utils"
import type { MessageItem } from "@/api/conversations"
import { getSenderName } from "@/lib/helper"
import Image from "next/image"
import { useState } from "react"
import { MessageActions } from "./message-actions"

type MessagePart = {
  text?: string
  url?: string
  thumbnailUrl?: string
  name?: string
  params?: Record<string, unknown>
}

const VIDEO_FALLBACK_WIDTH = 360
const VIDEO_FALLBACK_HEIGHT = 202
const VIDEO_MIN_WIDTH = 260
const VIDEO_MIN_HEIGHT = 146
const VIDEO_MAX_WIDTH = 440
const VIDEO_MAX_HEIGHT = 560

const IMAGE_MAX_WIDTH_CLASS = "max-w-[min(72vw,22rem)]"
const IMAGE_MAX_HEIGHT_CLASS = "max-h-[380px]"
const VIDEO_BOX_CLASS = "relative block overflow-hidden rounded-lg bg-muted/20 max-w-[min(78vw,28rem)]"

function getMessageParts(content: MessageItem["content"]): MessagePart[] {
  if (!content) return []
  if (typeof content === "string") return [{ text: content.trim() }]
  if (Array.isArray(content)) return content as MessagePart[]
  return [content as MessagePart]
}

function getMessageTextContent(content: MessageItem["content"]): string {
  return getMessageParts(content)
    .map((part) => part?.text?.trim())
    .filter((text): text is string => !!text)
    .join(" ")
    .trim()
}

function getPrimaryUrl(content: MessageItem["content"]): string {
  const parts = getMessageParts(content)
  for (const part of parts) {
    const url = part?.url?.trim() || part?.thumbnailUrl?.trim()
    if (url) return url
  }
  return ""
}

function getPrimaryThumbnailUrl(content: MessageItem["content"]): string {
  const parts = getMessageParts(content)
  for (const part of parts) {
    const url = part?.thumbnailUrl?.trim()
    if (url) return url
  }
  return ""
}

function getPrimaryFileName(content: MessageItem["content"]): string {
  const parts = getMessageParts(content)
  for (const part of parts) {
    const name = part?.name?.trim()
    if (name) return name
  }
  return "Tệp đính kèm"
}

function getNumberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return undefined
}

function fitMediaSize(
  rawWidth: number,
  rawHeight: number,
  bounds: { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number }
): { width: number; height: number } {
  let width = rawWidth
  let height = rawHeight

  const downScale = Math.min(bounds.maxWidth / width, bounds.maxHeight / height, 1)
  width *= downScale
  height *= downScale

  if (width < bounds.minWidth && height < bounds.minHeight) {
    const upScale = Math.max(bounds.minWidth / width, bounds.minHeight / height)
    width *= upScale
    height *= upScale
  }

  const finalScale = Math.min(bounds.maxWidth / width, bounds.maxHeight / height, 1)
  width *= finalScale
  height *= finalScale

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  }
}

function getMediaBoxStyle(size: { width: number; height: number } | null) {
  if (!size) {
    return {
      width: `${VIDEO_FALLBACK_WIDTH}px`,
      aspectRatio: `${VIDEO_FALLBACK_WIDTH} / ${VIDEO_FALLBACK_HEIGHT}`,
    } as const
  }
  return {
    width: `${size.width}px`,
    aspectRatio: `${size.width} / ${size.height}`,
  } as const
}

function getVideoDisplaySize(content: MessageItem["content"]): { width: number; height: number } | null {
  const parts = getMessageParts(content)
  for (const part of parts) {
    const params = part?.params
    if (!params) continue

    const width = getNumberValue(params.video_width) ?? getNumberValue(params.width)
    const height = getNumberValue(params.video_height) ?? getNumberValue(params.height)
    if (!width || !height) continue

    return fitMediaSize(width, height, {
      minWidth: VIDEO_MIN_WIDTH,
      minHeight: VIDEO_MIN_HEIGHT,
      maxWidth: VIDEO_MAX_WIDTH,
      maxHeight: VIDEO_MAX_HEIGHT,
    })
  }

  return null
}

function formatVideoDuration(content: MessageItem["content"]): string | null {
  const parts = getMessageParts(content)
  for (const part of parts) {
    const params = part?.params
    if (!params) continue

    const rawDuration = getNumberValue(params.duration)
    if (!rawDuration) continue

    const totalSeconds = rawDuration > 1000 ? Math.round(rawDuration / 1000) : Math.round(rawDuration)
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return null

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return null
}

type MessageContentProps = {
  message: MessageItem
  isCustomer: boolean
}

function BubbleShell({
  isCustomer,
  children,
  hasError,
}: {
  isCustomer: boolean
  children: React.ReactNode
  hasError: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed wrap-break-word",
        isCustomer ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
        isCustomer ? "rounded-tl-md" : "rounded-tr-md",
        hasError && "border border-red-500/70"
      )}
    >
      {children}
    </div>
  )
}

function TextMessageContent({ message, isCustomer }: MessageContentProps) {
  const text = getMessageTextContent(message.content)
  return (
    <BubbleShell isCustomer={isCustomer} hasError={message.status === "failed"}>
      {text || "[Tin nhắn trống]"}
    </BubbleShell>
  )
}

function ImageMessageContent({ message, isCustomer }: MessageContentProps) {
  const url = getPrimaryUrl(message.content)
  if (!url) return <TextMessageContent message={message} isCustomer={isCustomer} />

  return (
    <a href={url} target="_blank" rel="noreferrer" className={cn("block", isCustomer ? "mr-auto" : "ml-auto")}>
      <img
        src={url}
        alt="Image attachment"
        loading="lazy"
        className={cn(
          "block h-auto w-auto rounded-lg",
          IMAGE_MAX_WIDTH_CLASS,
          IMAGE_MAX_HEIGHT_CLASS,
          isCustomer ? "mr-auto" : "ml-auto"
        )}
      />
    </a>
  )
}

function FileMessageContent({ message }: MessageContentProps) {
  const url = getPrimaryUrl(message.content)
  const name = getPrimaryFileName(message.content)

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{name}</span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Mở tệp
        </a>
      ) : (
        <span>[Không có liên kết tệp]</span>
      )}
    </div>
  )
}

function VideoMessageContent({ message, isCustomer }: MessageContentProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const url = getPrimaryUrl(message.content)
  if (!url) return <TextMessageContent message={message} isCustomer={isCustomer} />
  const thumbnailUrl = getPrimaryThumbnailUrl(message.content) || url
  const size = getVideoDisplaySize(message.content)
  const durationLabel = formatVideoDuration(message.content)

  if (!isLoaded) {
    return (
      <button
        type="button"
        onClick={() => setIsLoaded(true)}
        className={cn("group", !size ? "mx-auto" : isCustomer ? "mr-auto" : "ml-auto")}
        aria-label="Phát video"
      >
        <span className={VIDEO_BOX_CLASS} style={getMediaBoxStyle(size)}>
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            unoptimized
            className={cn("object-contain", !size ? "object-center" : isCustomer ? "object-left" : "object-right")}
            sizes="(max-width: 768px) 78vw, 28rem"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur-[1px]">
              <span className="ml-0.5 h-0 w-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-white" />
            </span>
          </span>
          {durationLabel ? (
            <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {durationLabel}
            </span>
          ) : null}
        </span>
      </button>
    )
  }

  return (
    <span className={cn(VIDEO_BOX_CLASS, !size ? "mx-auto" : isCustomer ? "mr-auto" : "ml-auto")} style={getMediaBoxStyle(size)}>
      <video
        src={url}
        controls
        autoPlay
        playsInline
        preload="metadata"
        poster={thumbnailUrl}
        className={cn("absolute inset-0 h-full w-full object-contain", !size ? "object-center" : isCustomer ? "object-left" : "object-right")}
      />
    </span>
  )
}

function AudioMessageContent({ message, isCustomer }: MessageContentProps) {
  const url = getPrimaryUrl(message.content)
  if (!url) return <TextMessageContent message={message} isCustomer={isCustomer} />

  return <audio src={url} controls className="max-w-full" />
}

function RecommendedMessageContent({ message, isCustomer }: MessageContentProps) {
  const parts = getMessageParts(message.content)
  const part = parts[0] ?? {}
  const description = (part as { description?: string }).description?.trim()

  if (!description) return <TextMessageContent message={message} isCustomer={isCustomer} />

  return (
    <div
      className={cn(
        "w-[300px] sm:w-[320px] overflow-hidden rounded-2xl border shadow-sm",
        isCustomer
          ? "border-border bg-card text-card-foreground"
          : "border-primary/30 bg-primary/10 text-foreground",
        isCustomer ? "rounded-tl-md" : "rounded-tr-md",
        message.status === "failed" && "border-red-500/70"
      )}
    >
      <div className="p-4">
        <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function MessageContentByType({ message, isCustomer }: MessageContentProps) {
  switch (message.type) {
    case "text":
      return <TextMessageContent message={message} isCustomer={isCustomer} />
    case "image":
      return <ImageMessageContent message={message} isCustomer={isCustomer} />
    case "file":
      return <FileMessageContent message={message} isCustomer={isCustomer} />
    case "video":
      return <VideoMessageContent message={message} isCustomer={isCustomer} />
    case "audio":
      return <AudioMessageContent message={message} isCustomer={isCustomer} />
    case "recommended":
      return <RecommendedMessageContent message={message} isCustomer={isCustomer} />
    default:
      return <TextMessageContent message={message} isCustomer={isCustomer} />
  }
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

        <div className={cn("flex items-center gap-1", isCustomer ? "flex-row" : "flex-row-reverse")}>
          <MessageContentByType message={message} isCustomer={isCustomer} />
          <MessageActions isCustomer={isCustomer} content={message.content} />
        </div>

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
