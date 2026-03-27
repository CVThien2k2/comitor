"use client"

import { messages as messagesApi, type MessageItem } from "@/api/conversations"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { Icons } from "@/components/global/icons"
import { useConversations } from "@/hooks/use-conversations"
import { MESSAGES_PER_PAGE } from "@/lib/constants/messages"
import {
  getConversationDisplayName,
  getConversationTagLabel,
  getProviderLabel,
  mergeConversationSeedWithFetchedMessages,
} from "@/lib/helper"
import { ROUTES } from "@/lib/routes"
import { useChatStore } from "@/stores/chat-store"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useRouter } from "next/navigation"
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { MessageBubble } from "../_components/message-bubble"
import { ChatComposer } from "./chat-composer"

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

export function ChatDetailMessages() {
  const router = useRouter()
  const showUserInfo = useChatStore((s) => s.showUserInfoPanel)
  const toggleUserInfo = useChatStore((s) => s.toggleUserInfoPanel)
  const conversation = useChatStore((s) => s.selectedConversation)
  const conversationId = conversation?.id ?? ""
  const { markAsRead } = useConversations()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevPageCountRef = useRef(0)
  const prevScrollHeightRef = useRef(0)
  const prevMessageCountRef = useRef(0)
  const isInitialLoadRef = useRef(true)
  const prevConversationIdRef = useRef("")
  const shouldScrollToBottomRef = useRef(false)
  const isNearBottomRef = useRef(true)

  const id = conversationId

  const seedMessages = useMemo(() => conversation?.messages ?? [], [conversation?.messages])

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", "list", id, MESSAGES_PER_PAGE],
    queryFn: ({ pageParam = 1 }) => messagesApi.getByConversation(id, { page: pageParam, limit: MESSAGES_PER_PAGE }),
    enabled: !!id,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
    select: (queryData) => {
      const all = queryData.pages.flatMap((page) => page.data?.items ?? []).reverse()
      const seen = new Set<string>()
      return {
        pages: queryData.pages,
        pageParams: queryData.pageParams,
        messages: all.filter((m) => {
          if (seen.has(m.id)) return false
          seen.add(m.id)
          return true
        }),
      }
    },
  })

  const fetchedChronological = useMemo(() => data?.messages ?? [], [data?.messages])
  const messageList = useMemo(
    () => mergeConversationSeedWithFetchedMessages(seedMessages, fetchedChronological),
    [seedMessages, fetchedChronological]
  )
  const pageCount = data?.pages.length ?? 0

  const messageGroups = useMemo(() => {
    const FLOW_GAP_MS = 30 * 60 * 1000
    const groups: { startTime: string; messages: MessageItem[] }[] = []
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
        groups.push(current)
        current = { startTime: msg.createdAt, messages: [msg] }
      } else {
        current.messages.push(msg)
      }
    }

    if (current) groups.push(current)
    return groups
  }, [messageList])

  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== id) {
      prevConversationIdRef.current = id
      isInitialLoadRef.current = true
      prevPageCountRef.current = 0
      prevScrollHeightRef.current = 0
      prevMessageCountRef.current = 0
      isNearBottomRef.current = true
    }

    const el = scrollContainerRef.current
    if (!el || messageList.length === 0) return
    if (isLoading && seedMessages.length === 0) return

    if (isInitialLoadRef.current) {
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
    } else if (pageCount > prevPageCountRef.current) {
      const newScrollHeight = el.scrollHeight
      el.scrollTop = newScrollHeight - prevScrollHeightRef.current
    } else if (shouldScrollToBottomRef.current || messageList.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      shouldScrollToBottomRef.current = false
    }

    prevPageCountRef.current = pageCount
    prevMessageCountRef.current = messageList.length
  }, [id, messageList, pageCount, isLoading, seedMessages.length])

  // Khi đang mở cuộc trò chuyện:
  // - Nếu `selectedConversation` trong Zustand store còn unread (`unreadCount > 0`)
  //   hoặc có message chưa đọc (`messages[].isRead === false`)
  // thì tự động mark-as-read để UI + unread badge đồng bộ.
  useEffect(() => {
    const unreadCount = conversation?.unreadCount ?? 0
    const hasUnreadInStoreMessages = (conversation?.messages ?? []).some((m) => !m.isRead)

    if (unreadCount > 0 || hasUnreadInStoreMessages) {
      markAsRead(id)
    }
  }, [id, conversation?.unreadCount, conversation?.messages, markAsRead])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distanceFromBottom < 120

    if (!hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < 300) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const requestScrollToBottom = useCallback(() => {
    shouldScrollToBottomRef.current = true
  }, [])

  const handleBack = () => {
    router.push(ROUTES.conversations.path)
  }

  if (!conversation) return null

  const displayName = getConversationDisplayName(conversation)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-muted/50 px-2 py-2 backdrop-blur-sm sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5 md:gap-3">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={handleBack}>
            <Icons.chevronLeft className="h-5 w-5" />
          </Button>
          <ConversationAvatar
            id={id}
            name={displayName}
            provider={conversation.linkedAccount?.provider}
            avatarUrl={conversation.avatarUrl || undefined}
            className="size-8 md:size-10"
          />
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{displayName}</h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {conversation.linkedAccount?.provider && (
                <Badge className="h-5 max-w-full px-1.5 text-[10px] font-normal">
                  {getProviderLabel(conversation.linkedAccount?.provider)}
                </Badge>
              )}
              {conversation.tag === "business" && (
                <Badge className="h-5 max-w-full px-1.5 text-[10px] font-normal">
                  {getConversationTagLabel(conversation.tag)}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-foreground hover:bg-primary/20 hover:text-primary md:size-9"
            >
              <Icons.phone className="size-4 md:size-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-foreground hover:bg-primary/20 hover:text-primary md:size-9"
            >
              <Icons.video className="size-4 md:size-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-8 hover:bg-primary/20 hover:text-primary md:size-9",
                showUserInfo ? "bg-primary/20 text-primary" : "text-foreground"
              )}
              onClick={toggleUserInfo}
            >
              <Icons.moreHorizontal className="size-4 md:size-[18px]" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
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
            {messageGroups.map((group, groupIndex) => (
              <Fragment key={`${group.startTime}-${groupIndex}`}>
                <FlowSeparator startTime={group.startTime} />
                {group.messages.map((message, msgIndex) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showAvatar={msgIndex === 0 || group.messages[msgIndex - 1]?.senderType !== message.senderType}
                  />
                ))}
              </Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatComposer key={conversationId} onRequestScrollToBottom={requestScrollToBottom} />
    </div>
  )
}
