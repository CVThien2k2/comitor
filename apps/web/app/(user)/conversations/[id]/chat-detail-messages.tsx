"use client"

import { messagesApi, type ConversationItem, type MessageCursor } from "@/api/conversations"
import { MESSAGES_PER_PAGE } from "@/lib/constants"
import { mergeConversationSeedWithFetchedMessages } from "@/lib/helper"
import { ROUTES } from "@/lib/routes"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useLayoutEffect, useMemo, useRef } from "react"
import { ChatComposer } from "./chat-composer"
import { ChatDetailHeader } from "./chat-detail-header"
import { ChatMessagesList } from "./chat-messages-list"

// Khi scroll gần đỉnh container thì nạp thêm page cũ.
const TOP_FETCH_THRESHOLD_PX = 500

type ChatDetailMessagesProps = {
  conversation: ConversationItem
  showUserInfo: boolean
  onToggleUserInfo: () => void
}

export function ChatDetailMessages({ conversation, showUserInfo, onToggleUserInfo }: ChatDetailMessagesProps) {
  const router = useRouter()

  // Khóa hội thoại hiện tại.
  const conversationId = conversation.id

  // Refs phục vụ auto scroll và giữ vị trí khi load page cũ.
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef(0)
  const prevMessageCountRef = useRef(0)
  const isInitialLoadRef = useRef(true)
  const prevConversationIdRef = useRef("")
  const shouldScrollToBottomRef = useRef(false)
  const shouldKeepScrollPositionRef = useRef(false)

  // Seed messages lấy từ conversation detail để có dữ liệu tức thì trước khi query messages trả về.
  const seedMessages = useMemo(() => conversation.messages ?? [], [conversation.messages])

  // Query messages theo cursor paging (hướng "older").
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", "list", conversationId, MESSAGES_PER_PAGE],
    queryFn: ({ pageParam }) =>
      messagesApi.getByConversation(conversationId, {
        limit: MESSAGES_PER_PAGE,
        cursorTime: pageParam?.time,
        cursorId: pageParam?.id,
      }),
    enabled: !!conversationId,
    initialPageParam: null as MessageCursor | null,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.hasMore ? meta.nextCursor : undefined
    },
    // Chuẩn hóa messages về thứ tự tăng dần thời gian + loại bỏ trùng id giữa các page.
    select: (queryData) => {
      const all = queryData.pages.flatMap((page) => page.data?.items ?? [])
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
  const defaultMessageList = useMemo(
    () => mergeConversationSeedWithFetchedMessages(seedMessages, fetchedChronological),
    [seedMessages, fetchedChronological]
  )
  const messageList = defaultMessageList
  const isFetchingMore = isFetchingNextPage

  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId
      isInitialLoadRef.current = true
      prevScrollHeightRef.current = 0
      prevMessageCountRef.current = 0
      shouldKeepScrollPositionRef.current = false
    }

    const el = scrollContainerRef.current
    if (!el || messageList.length === 0) return
    if (isLoading && seedMessages.length === 0) return

    // Lần đầu vào chat: kéo xuống cuối cuộc trò chuyện.
    if (isInitialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" })
      if (!isLoading) {
        isInitialLoadRef.current = false
      }
      // Load page cũ hơn: giữ nguyên viewport bằng cách bù scrollHeight delta.
    } else if (shouldKeepScrollPositionRef.current) {
      const newScrollHeight = el.scrollHeight
      el.scrollTop = newScrollHeight - prevScrollHeightRef.current
      shouldKeepScrollPositionRef.current = false
      // Có tin mới (hoặc vừa gửi): kéo xuống cuối khi có cờ request.
    } else if (shouldScrollToBottomRef.current || messageList.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      shouldScrollToBottomRef.current = false
    }

    prevMessageCountRef.current = messageList.length
  }, [conversationId, messageList, isLoading, seedMessages.length])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    if (!hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < TOP_FETCH_THRESHOLD_PX) {
      prevScrollHeightRef.current = el.scrollHeight
      shouldKeepScrollPositionRef.current = true
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const requestScrollToBottom = useCallback(() => {
    shouldScrollToBottomRef.current = true
  }, [])

  const handleBack = useCallback(() => router.push(ROUTES.conversations.path), [router])

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatDetailHeader
        conversation={conversation}
        showUserInfo={showUserInfo}
        onBack={handleBack}
        onToggleUserInfo={onToggleUserInfo}
      />
      <ChatMessagesList
        isLoading={isLoading}
        isFetchingNextPage={isFetchingMore}
        messageList={messageList}
        onScroll={handleScroll}
        scrollContainerRef={scrollContainerRef}
        messagesEndRef={messagesEndRef}
      />

      {/* Composer */}
      <ChatComposer
        key={conversationId}
        conversationId={conversationId}
        onRequestScrollToBottom={requestScrollToBottom}
      />
    </div>
  )
}
