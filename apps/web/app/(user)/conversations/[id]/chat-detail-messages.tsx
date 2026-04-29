"use client"

import { ConversationItem, messagesApi } from "@/api/conversations"
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

type ChatDetailMessagesProps = {
  conversation: ConversationItem
  showUserInfo: boolean
  onToggleUserInfo: () => void
}

export function ChatDetailMessages({ conversation, showUserInfo, onToggleUserInfo }: ChatDetailMessagesProps) {
  const router = useRouter()

  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Khóa hội thoại hiện tại.
  const conversationId = conversation.id

  // Refs phục vụ auto scroll và giữ vị trí khi load page cũ.
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevPageCountRef = useRef(0)
  const prevScrollHeightRef = useRef(0)
  const prevMessageCountRef = useRef(0)
  const isInitialLoadRef = useRef(true)
  const prevConversationIdRef = useRef("")
  const shouldScrollToBottomRef = useRef(false)

  // Seed messages lấy từ conversation detail để có dữ liệu tức thì trước khi query messages trả về.
  const seedMessages = useMemo(() => conversation.messages ?? [], [conversation.messages])

  // Query messages theo infinite paging.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", "list", conversationId, MESSAGES_PER_PAGE],
    queryFn: ({ pageParam = 1 }) =>
      messagesApi.getByConversation(conversationId, { page: pageParam, limit: MESSAGES_PER_PAGE }),
    enabled: !!conversationId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
    // Chuẩn hóa messages về thứ tự tăng dần thời gian + loại bỏ trùng id giữa các page.
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

  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId
      isInitialLoadRef.current = true
      prevPageCountRef.current = 0
      prevScrollHeightRef.current = 0
      prevMessageCountRef.current = 0
    }

    const el = scrollContainerRef.current
    if (!el || messageList.length === 0) return
    if (isLoading && seedMessages.length === 0) return

    // Lần đầu vào chat: kéo xuống cuối cuộc trò chuyện.
    if (isInitialLoadRef.current) {
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
      // Load page cũ hơn: giữ nguyên viewport bằng cách bù scrollHeight delta.
    } else if (pageCount > prevPageCountRef.current) {
      const newScrollHeight = el.scrollHeight
      el.scrollTop = newScrollHeight - prevScrollHeightRef.current
      // Có tin mới (hoặc vừa gửi): kéo xuống cuối khi có cờ request.
    } else if (shouldScrollToBottomRef.current || messageList.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      shouldScrollToBottomRef.current = false
    }

    prevPageCountRef.current = pageCount
    prevMessageCountRef.current = messageList.length
  }, [conversationId, messageList, pageCount, isLoading, seedMessages.length])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    if (!hasNextPage || isFetchingNextPage) return
    // Kéo gần đỉnh thì nạp page trước đó.
    if (el.scrollTop < TOP_FETCH_THRESHOLD_PX) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleUserInfo={onToggleUserInfo}
      />
      <ChatMessagesList
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
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

      <MessageSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} messages={messageList} />
    </div>
  )
}
