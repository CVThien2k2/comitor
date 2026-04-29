"use client"

import { type MessageItem } from "@/api/conversations"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Fragment, type RefObject, useMemo } from "react"
import { MessageBubble } from "../_components/message-bubble"

// Nếu khoảng cách giữa 2 message đủ lớn thì tách thành flow mới.
const FLOW_GAP_MS = 30 * 60 * 1000

type MessageRenderItem = { message: MessageItem; showAvatar: boolean }
type MessageRenderGroup = { startTime: string; items: MessageRenderItem[] }

type ChatMessagesListProps = {
  isLoading: boolean
  isFetchingNextPage: boolean
  messageList: MessageItem[]
  onScroll: () => void
  scrollContainerRef: RefObject<HTMLDivElement | null>
  messagesEndRef: RefObject<HTMLDivElement | null>
}

function FlowSeparator({ startTime }: { startTime: string }) {
  const d = new Date(startTime)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const timeLabel = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  const dateLabel = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-border/70" />
      <div className="flex items-center gap-2 px-2 leading-none">
        <span className="text-[11px] font-medium text-muted-foreground">{timeLabel}</span>
        {!isToday && <span className="text-[11px] font-medium text-muted-foreground/80">{dateLabel}</span>}
      </div>
      <div className="h-px flex-1 bg-border/70" />
    </div>
  )
}

function MessageListSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3 py-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const isLeft = i % 2 === 0
        return (
          <div key={i} className={cn("flex max-w-[70%] gap-2.5", isLeft ? "self-start" : "flex-row-reverse self-end")}>
            {isLeft && <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />}
            <div className={cn("space-y-1.5", !isLeft && "flex flex-col items-end")}>
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div
                className={cn(
                  "h-10 animate-pulse rounded-2xl bg-muted",
                  isLeft ? "w-48 rounded-tl-md" : "w-40 rounded-tr-md"
                )}
              />
              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const getMessageSenderKey = (message: MessageItem) => {
  // Dùng sender key để xác định có cần hiện avatar cho message hiện tại hay không.
  return `${message.senderType}:${message.accountCustomerId ?? message.createdBy ?? "unknown"}`
}

const buildMessageRenderItems = (messages: MessageItem[]): MessageRenderItem[] => {
  // Ẩn avatar liên tiếp nếu cùng sender để giao diện gọn hơn.
  return messages.map((message, index) => {
    const previous = messages[index - 1]
    const showAvatar = !previous || getMessageSenderKey(previous) !== getMessageSenderKey(message)
    return { message, showAvatar }
  })
}

export function ChatMessagesList({
  isLoading,
  isFetchingNextPage,
  messageList,
  onScroll,
  scrollContainerRef,
  messagesEndRef,
}: ChatMessagesListProps) {
  // Gom message thành từng flow theo thời gian để dễ nhìn.
  const renderGroups = useMemo(() => {
    const groupedMessages: { startTime: string; messages: MessageItem[] }[] = []
    let current: { startTime: string; messages: MessageItem[] } | null = null

    for (const msg of messageList) {
      const msgTime = new Date(msg.createdAt).getTime()
      const msgHour = new Date(msg.createdAt).getHours()

      if (!current) {
        current = { startTime: msg.createdAt, messages: [msg] }
        continue
      }

      const lastMsg = current.messages[current.messages.length - 1]!
      const lastMsgTime = new Date(lastMsg.createdAt).getTime()
      const lastMsgHour = new Date(lastMsg.createdAt).getHours()

      const shouldSplit = lastMsgHour !== msgHour || msgTime - lastMsgTime >= FLOW_GAP_MS

      if (shouldSplit) {
        groupedMessages.push(current)
        current = { startTime: msg.createdAt, messages: [msg] }
      } else {
        current.messages.push(msg)
      }
    }

    if (current) groupedMessages.push(current)

    // Precompute render items theo từng group để tránh chạy buildMessageRenderItems trong render loop.
    return groupedMessages.map((group) => ({
      startTime: group.startTime,
      items: buildMessageRenderItems(group.messages),
    })) satisfies MessageRenderGroup[]
  }, [messageList])

  return (
    <div
      ref={scrollContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto bg-background px-2 py-3 sm:px-3 sm:py-4 md:px-4"
    >
      {(isFetchingNextPage || isLoading) && <MessageListSkeleton count={10} />}

      {isLoading && messageList.length === 0 ? (
        <MessageListSkeleton count={20} />
      ) : messageList.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <Icons.messageSquare className="mb-3 size-10 opacity-40" />
          <p className="text-sm">Chưa có tin nhắn nào</p>
          <p className="mt-1 text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-1">
          {renderGroups.map((group, groupIndex) => (
            <Fragment key={`${group.startTime}-${groupIndex}`}>
              <FlowSeparator startTime={group.startTime} />
              {group.items.map((item) => {
                return <MessageBubble key={item.message.id} message={item.message} showAvatar={item.showAvatar} />
              })}
            </Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
