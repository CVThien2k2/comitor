"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { messages as messagesApi } from "@/api/conversations"
import type { ConversationItem, MessageItem, CreateMessagePayload } from "@/api/conversations"
import {
  getInitials,
  getConversationDisplayName,
  getProviderLabel,
  getAvatarColor,
  formatMessageDate,
} from "@/lib/helper"
import { MessageBubble } from "./message-bubble"

// ─── Đường phân cách ngày ───────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="px-2 text-xs font-medium text-muted-foreground">{date}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// ─── Bảng tin nhắn ──────────────────────────────────────

export function ChatPanel({
  conversation,
  onBack,
  onToggleCustomerPanel,
}: {
  conversation: ConversationItem
  onBack?: () => void
  onToggleCustomerPanel?: () => void
}) {
  const [inputValue, setInputValue] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // ─── Lấy danh sách tin nhắn (phân trang vô hạn) ──────
  // Server trả về mới→cũ (desc), client reverse lại thành cũ→mới để hiển thị
  // Page 1 = 30 tin mới nhất, page 2 = 30 tin tiếp theo (cũ hơn), ...
  const MESSAGES_PER_PAGE = 30
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", "list", conversation.id, MESSAGES_PER_PAGE],
    queryFn: ({ pageParam = 1 }) =>
      messagesApi.getByConversation(conversation.id, { page: pageParam, limit: MESSAGES_PER_PAGE }),
    initialPageParam: 1,
    // Xác định page tiếp theo: nếu chưa hết trang thì trả về số trang kế, hết thì undefined (dừng)
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
    // Gộp tất cả pages thành 1 mảng và đảo ngược: cũ ở trên, mới ở dưới
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      messages: data.pages
        .flatMap((page) => page.data?.items ?? [])
        .reverse(),
    }),
  })

  // ─── Gửi tin nhắn ────────────────────────────────────
  const sendMessage = useMutation({
    mutationFn: (payload: CreateMessagePayload) => messagesApi.create(payload),
    onSuccess: () => {},
  })

  // ─── Danh sách tin nhắn đã gộp ───────────────────────
  const messageList = React.useMemo(() => data?.messages ?? [], [data?.messages])
  const pageCount = data?.pages.length ?? 0
  const prevPageCountRef = React.useRef(0) // Số page trước đó, dùng để phát hiện load thêm tin cũ
  const prevScrollHeightRef = React.useRef(0) // Chiều cao scroll trước khi load thêm, dùng để giữ vị trí
  const isInitialLoadRef = React.useRef(true) // Đánh dấu lần đầu load tin nhắn

  // ─── Nhóm tin nhắn theo ngày ─────────────────────────
  // Duyệt qua messageList, mỗi khi gặp ngày mới thì tạo group mới
  const messageGroups = React.useMemo(() => {
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

  // ─── Quản lý vị trí scroll ───────────────────────────
  // useLayoutEffect chạy SAU khi React cập nhật DOM nhưng TRƯỚC khi trình duyệt vẽ
  // → Đảm bảo không bị giật khi thay đổi nội dung
  React.useLayoutEffect(() => {
    const el = scrollContainerRef.current
    if (!el || isLoading || messageList.length === 0) return

    if (isInitialLoadRef.current) {
      // Lần đầu: nhảy thẳng xuống cuối, không có animation
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
    } else if (pageCount > prevPageCountRef.current) {
      // Load thêm tin cũ: giữ nguyên vị trí nhìn, tin cũ hiện thêm phía trên
      const newScrollHeight = el.scrollHeight
      el.scrollTop = newScrollHeight - prevScrollHeightRef.current
    } else {
      // Tin nhắn mới (gửi/nhận): cuộn mượt xuống cuối
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    prevPageCountRef.current = pageCount
  }, [messageList, pageCount, isLoading])

  // ─── Reset khi chuyển cuộc trò chuyện ────────────────
  React.useEffect(() => {
    isInitialLoadRef.current = true
    prevPageCountRef.current = 0
    prevScrollHeightRef.current = 0
  }, [conversation.id])

  // ─── Xử lý cuộn lên để load thêm tin cũ ─────────────
  // Khi cuộn gần đến đỉnh (scrollTop < 100px) → lưu chiều cao hiện tại → gọi fetchNextPage
  const handleScroll = React.useCallback(() => {
    const el = scrollContainerRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < 100) {
      // Lưu chiều cao TRƯỚC khi fetch để sau đó tính toán giữ vị trí scroll
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // ─── Gửi tin nhắn ────────────────────────────────────
  const handleSend = () => {
    const content = inputValue.trim()
    if (!content) return

    sendMessage.mutate({
      conversationId: conversation.id,
      content,
    })
    setInputValue("") // Xóa ô nhập ngay, không chờ server phản hồi
  }

  // Enter gửi tin, Shift+Enter xuống dòng
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const displayName = getConversationDisplayName(conversation)
  const initials = getInitials(displayName)
  const avatarColor = getAvatarColor(conversation.id)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon-sm" onClick={onBack}>
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="size-10">
            <AvatarFallback className="text-sm font-semibold text-white" style={{ backgroundColor: avatarColor }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                {getProviderLabel(conversation.linkedAccount.provider)}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {conversation.type === "group" && (
                <>
                  <Icons.users className="size-3" />
                  <span>Nhóm</span>
                </>
              )}
              {conversation.tag === "business" && <span>Kinh doanh</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Icons.phone className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Icons.video className="size-4" />
          </Button>
          {onToggleCustomerPanel && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onToggleCustomerPanel}
            >
              <Icons.panelRight className="size-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Icons.moreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* ─── Vùng hiển thị tin nhắn ─────────────────────── */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-background px-4 py-4">
        {/* Hiển thị loading khi đang tải thêm tin cũ */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          /* Skeleton loading lần đầu */
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
          /* Trạng thái trống - chưa có tin nhắn */
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Icons.messageSquare className="mb-3 size-10 opacity-40" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="mt-1 text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          /* Danh sách tin nhắn theo nhóm ngày */
          <div className="flex flex-col gap-1">
            {messageGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                <DateSeparator date={group.date} />
                {group.messages.map((message, msgIndex) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    conversationAvatarColor={avatarColor}
                    showAvatar={msgIndex === 0 || group.messages[msgIndex - 1]?.senderType !== message.senderType}
                  />
                ))}
              </React.Fragment>
            ))}
            {/* Điểm neo cuối cùng để scroll xuống */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ─── Ô nhập tin nhắn ────────────────────────────── */}
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
