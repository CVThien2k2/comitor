"use client"

import { messages as messagesApi, type Conversation, type MessageItem } from "@/api/conversations"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { Icons } from "@/components/global/icons"
import { useMessages } from "@/hooks/use-messages"
import { formatMessageDate, getConversationDisplayName, getConversationTagLabel, getProviderLabel } from "@/lib/helper"
import { ROUTES } from "@/lib/routes"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useRouter } from "next/navigation"
import { Fragment, useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { MessageBubble } from "../_components/message-bubble"

const MESSAGES_PER_PAGE = 30

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="px-2 text-xs font-medium text-muted-foreground">{date}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export function ChatDetailMessages({ conversation }: { conversation: Conversation }) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevPageCountRef = useRef(0)
  const prevScrollHeightRef = useRef(0)
  const isInitialLoadRef = useRef(true)
  const prevConversationIdRef = useRef("")

  const id = conversation.id

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

  const { sendMessage } = useMessages(id)
  const messageList = useMemo(() => data?.messages ?? [], [data?.messages])
  const pageCount = data?.pages.length ?? 0

  const messageGroups = useMemo(() => {
    const groups: { date: string; messages: MessageItem[] }[] = []
    let currentDate = ""

    messageList.forEach((msg) => {
      const dateLabel = formatMessageDate(msg.createdAt)
      if (dateLabel !== currentDate) {
        currentDate = dateLabel
        groups.push({ date: dateLabel, messages: [msg] })
      } else {
        groups[groups.length - 1]?.messages.push(msg)
      }
    })

    return groups
  }, [messageList])

  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== id) {
      prevConversationIdRef.current = id
      isInitialLoadRef.current = true
      prevPageCountRef.current = 0
      prevScrollHeightRef.current = 0
    }

    const el = scrollContainerRef.current
    if (!el || isLoading || messageList.length === 0) return

    if (isInitialLoadRef.current) {
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
    } else if (pageCount > prevPageCountRef.current) {
      const newScrollHeight = el.scrollHeight
      el.scrollTop = newScrollHeight - prevScrollHeightRef.current
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    prevPageCountRef.current = pageCount
  }, [id, messageList, pageCount, isLoading])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < 100) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!content || sendMessage.isPending) return

    sendMessage.mutate({
      conversationId: id,
      content,
    })
    setInputValue("")
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBack = () => {
    router.push(ROUTES.conversations.path)
  }

  const displayName = getConversationDisplayName(conversation)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-muted/50 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={handleBack}>
            <Icons.chevronLeft className="h-5 w-5" />
          </Button>
          <ConversationAvatar
            id={id}
            name={displayName}
            provider={conversation.linkedAccount?.provider}
            className="size-8 md:size-10"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{displayName}</h3>
            </div>
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
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-background px-4 py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3 py-4">
            {Array.from({ length: 20 }).map((_, i) => {
              const isLeft = i % 2 === 0
              return (
                <div
                  key={i}
                  className={cn("flex max-w-[70%] gap-2.5", isLeft ? "self-start" : "flex-row-reverse self-end")}
                >
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
        ) : messageList.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Icons.messageSquare className="mb-3 size-10 opacity-40" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="mt-1 text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {messageGroups.map((group, groupIndex) => (
              <Fragment key={groupIndex}>
                <DateSeparator date={group.date} />
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

      <div className="border-t border-border bg-muted/50 p-4">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn"
            rows={2}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                <Icons.paperclip className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                <Icons.smile className="size-4" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleSend}
              disabled={!inputValue.trim() || sendMessage.isPending}
              className="h-8 gap-1.5 px-4"
            >
              {sendMessage.isPending ? (
                <Icons.spinner className="size-3.5 animate-spin" />
              ) : (
                <Icons.send className="size-3.5" />
              )}
              <span className="text-xs">Gửi</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
