"use client"

import { type ConversationItem, messagesApi, type MessageCursor, type MessageItem } from "@/api/conversations"
import { MESSAGES_PER_PAGE } from "@/lib/constants"
import { mergeConversationSeedWithFetchedMessages } from "@/lib/helper"
import { ROUTES } from "@/lib/routes"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChatComposer } from "./chat-composer"
import { ChatDetailHeader } from "./chat-detail-header"
import { ChatMessagesList } from "./chat-messages-list"
import { MessageSearchDialog } from "./message-search-dialog"

// Khi scroll gần đỉnh container thì nạp thêm page cũ.
const TOP_FETCH_THRESHOLD_PX = 300
// Khi scroll gần đáy thì nạp thêm page mới hơn (chỉ dùng ở jump mode).
const BOTTOM_FETCH_THRESHOLD_PX = 300

type ChatDetailMessagesProps = {
  conversation: ConversationItem
  showUserInfo: boolean
  onToggleUserInfo: () => void
}

export function ChatDetailMessages({ conversation, showUserInfo, onToggleUserInfo }: ChatDetailMessagesProps) {
  const router = useRouter()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isJumpLoading, setIsJumpLoading] = useState(false)
  const [isFetchingJumpOlder, setIsFetchingJumpOlder] = useState(false)
  const [isFetchingJumpNewer, setIsFetchingJumpNewer] = useState(false)
  const [jumpMessages, setJumpMessages] = useState<MessageItem[] | null>(null)
  const [olderJumpCursor, setOlderJumpCursor] = useState<MessageCursor | null>(null)
  const [newerJumpCursor, setNewerJumpCursor] = useState<MessageCursor | null>(null)
  const [hasMoreJumpOlder, setHasMoreJumpOlder] = useState(false)
  const [hasMoreJumpNewer, setHasMoreJumpNewer] = useState(false)

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
        direction: "older",
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
  const messageList = jumpMessages ?? defaultMessageList
  const isManualJumpMode = jumpMessages !== null
  const isFetchingMore = isFetchingNextPage || isFetchingJumpOlder || isFetchingJumpNewer

  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId
      isInitialLoadRef.current = true
      prevScrollHeightRef.current = 0
      prevMessageCountRef.current = 0
      shouldKeepScrollPositionRef.current = false
      setJumpMessages(null)
      setOlderJumpCursor(null)
      setNewerJumpCursor(null)
      setHasMoreJumpOlder(false)
      setHasMoreJumpNewer(false)
    }

    const el = scrollContainerRef.current
    if (!el || messageList.length === 0) return
    if ((isLoading || isJumpLoading) && seedMessages.length === 0) return

    // Lần đầu vào chat: kéo xuống cuối cuộc trò chuyện.
    if (isInitialLoadRef.current) {
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
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
  }, [conversationId, messageList, isLoading, isJumpLoading, seedMessages.length])

  const loadJumpOlder = useCallback(async () => {
    if (!olderJumpCursor || isFetchingJumpOlder) return

    setIsFetchingJumpOlder(true)
    let hasNewItems = false
    try {
      const response = await messagesApi.getByConversation(conversationId, {
        limit: MESSAGES_PER_PAGE,
        direction: "older",
        cursorTime: olderJumpCursor.time,
        cursorId: olderJumpCursor.id,
      })

      const payload = response.data
      const items = payload?.items ?? []
      const meta = payload?.meta
      hasNewItems = items.length > 0

      if (items.length > 0) {
        setJumpMessages((prev) => mergeConversationSeedWithFetchedMessages(prev ?? [], items))
      }

      setHasMoreJumpOlder(Boolean(meta?.hasMore))
      setOlderJumpCursor(meta?.nextCursor ?? null)
    } finally {
      if (!hasNewItems) shouldKeepScrollPositionRef.current = false
      setIsFetchingJumpOlder(false)
    }
  }, [conversationId, isFetchingJumpOlder, olderJumpCursor])

  const loadJumpNewer = useCallback(async () => {
    if (!newerJumpCursor || isFetchingJumpNewer) return

    setIsFetchingJumpNewer(true)
    try {
      const response = await messagesApi.getByConversation(conversationId, {
        limit: MESSAGES_PER_PAGE,
        direction: "newer",
        cursorTime: newerJumpCursor.time,
        cursorId: newerJumpCursor.id,
      })

      const payload = response.data
      const items = payload?.items ?? []
      const meta = payload?.meta

      if (items.length > 0) {
        setJumpMessages((prev) => mergeConversationSeedWithFetchedMessages(prev ?? [], items))
      }

      setHasMoreJumpNewer(Boolean(meta?.hasMore))
      setNewerJumpCursor(meta?.nextCursor ?? null)
    } finally {
      setIsFetchingJumpNewer(false)
    }
  }, [conversationId, isFetchingJumpNewer, newerJumpCursor])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    if (isManualJumpMode) {
      if (!isFetchingJumpOlder && hasMoreJumpOlder && el.scrollTop < TOP_FETCH_THRESHOLD_PX) {
        prevScrollHeightRef.current = el.scrollHeight
        shouldKeepScrollPositionRef.current = true
        void loadJumpOlder()
      }

      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (!isFetchingJumpNewer && hasMoreJumpNewer && distanceToBottom < BOTTOM_FETCH_THRESHOLD_PX) {
        void loadJumpNewer()
      }

      return
    }

    if (!hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < TOP_FETCH_THRESHOLD_PX) {
      prevScrollHeightRef.current = el.scrollHeight
      shouldKeepScrollPositionRef.current = true
      fetchNextPage()
    }
  }, [
    fetchNextPage,
    hasMoreJumpNewer,
    hasMoreJumpOlder,
    hasNextPage,
    isFetchingJumpNewer,
    isFetchingJumpOlder,
    isFetchingNextPage,
    isManualJumpMode,
    loadJumpNewer,
    loadJumpOlder,
  ])

  const requestScrollToBottom = useCallback(() => {
    shouldScrollToBottomRef.current = true
  }, [])

  const handleSelectSearchMessage = useCallback(
    async (messageId: string) => {
      setIsJumpLoading(true)
      try {
        const response = await messagesApi.getAroundMessage(conversationId, messageId, {
          before: MESSAGES_PER_PAGE,
          after: MESSAGES_PER_PAGE,
        })
        const payload = response.data

        setJumpMessages(payload?.items ?? [])
        setHasMoreJumpOlder(Boolean(payload?.meta?.hasMoreOlder))
        setHasMoreJumpNewer(Boolean(payload?.meta?.hasMoreNewer))
        setOlderJumpCursor(payload?.meta?.olderCursor ?? null)
        setNewerJumpCursor(payload?.meta?.newerCursor ?? null)
        setIsSearchOpen(false)

        shouldScrollToBottomRef.current = false
        requestAnimationFrame(() => {
          const target = document.getElementById(`message-${messageId}`)
          target?.scrollIntoView({ behavior: "smooth", block: "center" })
        })
      } finally {
        setIsJumpLoading(false)
      }
    },
    [conversationId]
  )

  const handleBack = useCallback(() => router.push(ROUTES.conversations.path), [router])

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatDetailHeader
        conversation={conversation}
        showUserInfo={showUserInfo}
        onBack={handleBack}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleUserInfo={onToggleUserInfo}
      />
      <ChatMessagesList
        isLoading={isLoading || isJumpLoading}
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

      <MessageSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        conversationId={conversationId}
        onSelectMessage={handleSelectSearchMessage}
      />
    </div>
  )
}
