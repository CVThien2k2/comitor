"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import { useResizablePanel } from "@workspace/ui/hooks/use-resizable-panel"
import {
  useConversations,
  useMessages,
  useSendMessage,
} from "@/hooks/use-conversations"
import type { ConversationItem, MessageItem } from "@/api/conversations"

// ─── Helpers ────────────────────────────────────────────

function getInitials(name: string | null | undefined) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 86400000

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }
  if (diff < oneDay * 2) return "Hôm qua"
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

function formatMessageDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 86400000

  if (diff < oneDay && date.getDate() === now.getDate()) return "Hôm nay"
  if (diff < oneDay * 2) return "Hôm qua"
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function getConversationDisplayName(conv: ConversationItem) {
  if (conv.name) return conv.name
  const customer = conv.lastMessage?.accountCustomer
  if (customer?.goldenProfile?.fullName) return customer.goldenProfile.fullName
  return "Khách hàng"
}

function getProviderLabel(provider: string) {
  const map: Record<string, string> = {
    zalo_oa: "Zalo OA",
    zalo_personal: "Zalo",
    facebook: "Facebook",
    gmail: "Gmail",
    phone: "Phone",
  }
  return map[provider] || provider
}

function getSenderName(msg: MessageItem) {
  if (msg.senderType === "customer") {
    return msg.accountCustomer?.goldenProfile?.fullName || "Khách hàng"
  }
  if (msg.senderType === "agent") {
    return msg.user?.name || "Agent"
  }
  return "Hệ thống"
}

// ─── Conversation List Item ─────────────────────────────

function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: ConversationItem
  isSelected: boolean
  onClick: () => void
}) {
  const displayName = getConversationDisplayName(conversation)
  const initials = getInitials(displayName)
  const lastMsg = conversation.lastMessage
  const isUnread = conversation.unreadCount > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-all duration-200 border-b border-border",
        "hover:bg-accent/50",
        isSelected && "bg-accent/70 border-l-2 border-l-primary",
        isUnread && !isSelected && "bg-primary/[0.03]"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarFallback className="text-xs font-semibold text-white bg-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full flex items-center justify-center border-2 border-background bg-muted text-muted-foreground">
          <span className="text-[8px] font-bold">
            {conversation.linkedAccount.provider.charAt(0).toUpperCase()}
          </span>
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-sm truncate",
              isUnread ? "text-foreground" : "text-foreground/80"
            )}
          >
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              {formatTimestamp(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal shrink-0">
            {getProviderLabel(conversation.linkedAccount.provider)}
          </Badge>
          {conversation.tag === "business" && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal text-blue-600 border-blue-200 shrink-0">
              B2B
            </Badge>
          )}
        </div>

        {lastMsg && (
          <p
            className={cn(
              "text-sm truncate",
              isUnread ? "text-foreground/90 font-medium" : "text-muted-foreground"
            )}
          >
            {lastMsg.senderType === "agent" && "Bạn: "}
            {lastMsg.content || "[Tệp đính kèm]"}
          </p>
        )}
      </div>

      {isUnread && (
        <Badge className="size-5 p-0 text-[10px] bg-primary text-primary-foreground shrink-0 mt-1.5 justify-center">
          {conversation.unreadCount}
        </Badge>
      )}
    </button>
  )
}

// ─── Conversation List ──────────────────────────────────

function ConversationListPanel({
  conversations,
  isLoading,
  selectedId,
  onSelect,
}: {
  conversations: ConversationItem[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")

  const filtered = React.useMemo(() => {
    let list = conversations

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((c) => {
        const name = getConversationDisplayName(c).toLowerCase()
        const content = c.lastMessage?.content?.toLowerCase() || ""
        return name.includes(q) || content.includes(q)
      })
    }

    if (activeTab === "unread") {
      list = list.filter((c) => c.unreadCount > 0)
    }

    return list
  }, [conversations, searchQuery, activeTab])

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Hội thoại</h2>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <Icons.filter className="size-4" />
          </Button>
        </div>

        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hội thoại..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-border"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-8 p-0.5 bg-muted/70">
            <TabsTrigger value="all" className="flex-1 h-7 text-xs">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 h-7 text-xs gap-1">
              Chưa đọc
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="size-5 p-0 text-[10px] bg-primary text-primary-foreground"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="size-10 rounded-full shrink-0 animate-pulse bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded animate-pulse bg-muted" />
                  <div className="h-3 w-48 rounded animate-pulse bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Icons.messageSquare className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Không có hội thoại nào</p>
          </div>
        ) : (
          filtered.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Message Bubble ─────────────────────────────────────

function MessageBubble({
  message,
  showAvatar = true,
}: {
  message: MessageItem
  showAvatar?: boolean
}) {
  const isCustomer = message.senderType === "customer"
  const senderName = getSenderName(message)
  const initials = getInitials(senderName)
  const avatarUrl = isCustomer
    ? message.accountCustomer?.avatarUrl
    : message.user?.avatarUrl

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
          <AvatarFallback className="text-xs font-semibold text-white bg-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && isCustomer && <div className="size-8 shrink-0" />}

      <div className={cn("flex flex-col gap-1", isCustomer ? "items-start" : "items-end")}>
        {isCustomer && showAvatar && (
          <span className="text-xs text-muted-foreground ml-1">{senderName}</span>
        )}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isCustomer
              ? "bg-muted text-foreground rounded-tl-md"
              : "bg-primary text-primary-foreground rounded-tr-md"
          )}
        >
          {message.content || "[Tệp đính kèm]"}
        </div>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.attachments.map((att) => (
              <div key={att.id}>
                {att.fileMimeType?.startsWith("image/") && att.fileUrl ? (
                  <img
                    src={att.fileUrl}
                    alt={att.fileName || "attachment"}
                    className="max-w-[240px] rounded-lg border border-border"
                    loading="lazy"
                  />
                ) : att.fileUrl ? (
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border hover:bg-muted/80 text-sm"
                  >
                    <Icons.paperclip className="size-4" />
                    <span className="truncate max-w-[160px]">{att.fileName || "Tệp đính kèm"}</span>
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatTimestamp(message.createdAt)}
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

// ─── Date Separator ─────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium px-2">{date}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Chat Window ────────────────────────────────────────

function ChatPanel({
  conversation,
  onBack,
}: {
  conversation: ConversationItem
  onBack?: () => void
}) {
  const [inputValue, setInputValue] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversation.id)
  const sendMessage = useSendMessage()

  const messageList = data?.messages ?? []

  // Group messages by date
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

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messageList.length])

  // Infinite scroll: load older messages when scrolling to top
  const handleScroll = React.useCallback(() => {
    const el = scrollContainerRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < 100) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!content) return

    sendMessage.mutate({
      conversationId: conversation.id,
      content,
    })
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const displayName = getConversationDisplayName(conversation)
  const initials = getInitials(displayName)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon-sm" onClick={onBack}>
              <Icons.chevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Avatar className="size-10">
            <AvatarFallback className="text-sm font-semibold text-white bg-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
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
            <Icons.moreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 bg-background"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("flex gap-2.5 max-w-[70%]", i % 2 === 0 ? "self-start" : "self-end ml-auto")}>
                {i % 2 === 0 && <div className="size-8 rounded-full shrink-0 animate-pulse bg-muted" />}
                <div className="space-y-1.5">
                  <div className="h-10 w-48 rounded-2xl animate-pulse bg-muted" />
                  <div className="h-3 w-12 rounded animate-pulse bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : messageList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Icons.messageSquare className="size-10 mb-3 opacity-40" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {messageGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                <DateSeparator date={group.date} />
                {group.messages.map((message, msgIndex) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showAvatar={
                      msgIndex === 0 ||
                      group.messages[msgIndex - 1]?.senderType !== message.senderType
                    }
                  />
                ))}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-background border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={2}
            className="w-full bg-transparent resize-none text-sm placeholder:text-muted-foreground text-foreground focus:outline-none"
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
              className="h-8 px-4 gap-1.5"
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

// ─── Empty State ────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <Icons.messageSquare className="size-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">Chọn một hội thoại</p>
        <p className="text-sm mt-1">Chọn một hội thoại từ danh sách bên trái để bắt đầu</p>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────

export function ConversationsContent() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [mobileView, setMobileView] = React.useState<"list" | "chat">("list")
  const { width: listWidth, isResizing, handleMouseDown: onResizeStart } = useResizablePanel({
    storageKey: "elines-conversation-list-width",
    minWidth: 320,
    defaultWidth: 320,
    maxWidth: 480,
  })

  const { data: conversationData, isLoading: isLoadingConversations } = useConversations()
  const conversationList = conversationData?.items ?? []

  const selectedConversation = conversationList.find((c) => c.id === selectedId) ?? null

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    if (window.innerWidth < 768) {
      setMobileView("chat")
    }
  }

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Desktop (>=768px) - 2 column layout */}
      <div className="hidden md:flex w-full">
        {/* Left Column - Conversation List */}
        <div className="shrink-0 border-r border-border relative" style={{ width: listWidth }}>
          <ConversationListPanel
            conversations={conversationList}
            isLoading={isLoadingConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
          <div
            onMouseDown={onResizeStart}
            className={cn(
              "absolute right-0 top-0 h-full w-1 cursor-col-resize z-10 transition-colors hover:bg-primary/30",
              isResizing && "bg-primary/40"
            )}
          />
        </div>

        {/* Right Column - Chat */}
        <div className="flex-1 min-w-0">
          {selectedConversation ? (
            <ChatPanel conversation={selectedConversation} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Mobile (<768px) - View switching */}
      <div className="md:hidden w-full flex flex-col">
        {mobileView === "list" ? (
          <ConversationListPanel
            conversations={conversationList}
            isLoading={isLoadingConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
        ) : selectedConversation ? (
          <ChatPanel
            conversation={selectedConversation}
            onBack={() => setMobileView("list")}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
