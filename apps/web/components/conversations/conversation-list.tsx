"use client"

import type { ConversationItem } from "@/api/conversations"
import { conversations } from "@/api/conversations"
import { Icons } from "@/components/global/icons"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
  channelConfig,
  formatTimestamp,
  getAvatarColor,
  getConversationDisplayName,
  getInitials,
  getProviderLabel,
} from "@/lib/helper"

// ─── Channel Icon Resolver ──────────────────────────────

const channelIconMap: Record<string, React.FC<{ className?: string }>> = {
  zalo_oa: Icons.zalo,
  zalo_personal: Icons.zalo,
  facebook: Icons.facebook,
  gmail: Icons.gmail,
  phone: Icons.phoneChannel,
}

function ChannelBadge({ provider }: { provider: string }) {
  const Icon = channelIconMap[provider] ?? Icons.website
  const config = channelConfig[provider] ?? { color: "text-muted-foreground", bg: "bg-muted" }

  return (
    <span
      className={cn(
        "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background",
        config.bg,
        config.color
      )}
    >
      <Icon />
    </span>
  )
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
  const avatarColor = getAvatarColor(conversation.id)

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-all duration-200",
        "hover:bg-accent/50",
        isSelected && "border-l-2 border-l-primary bg-accent/70",
        isUnread && !isSelected && "bg-primary/3"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: avatarColor }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <ChannelBadge provider={conversation.linkedAccount.provider} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm font-medium", isUnread ? "text-foreground" : "text-foreground/80")}>
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-[11px] whitespace-nowrap text-muted-foreground">
              {formatTimestamp(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="h-4 shrink-0 px-1 text-[9px] font-normal">
            {getProviderLabel(conversation.linkedAccount.provider)}
          </Badge>
          {conversation.tag === "business" && (
            <Badge variant="outline" className="h-4 shrink-0 border-blue-200 px-1 text-[9px] font-normal text-blue-600">
              B2B
            </Badge>
          )}
        </div>

        {lastMsg && (
          <p className={cn("truncate text-sm", isUnread ? "font-medium text-foreground/90" : "text-muted-foreground")}>
            {lastMsg.senderType === "agent" && "Bạn: "}
            {lastMsg.content || "[Tệp đính kèm]"}
          </p>
        )}
      </div>

      {isUnread && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />}
    </button>
  )
}

// ─── Conversation List Panel ────────────────────────────

export function ConversationListPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (conversation: ConversationItem) => void
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const deferredSearchQuery = React.useDeferredValue(searchQuery)
  const [activeTab, setActiveTab] = React.useState("all")

  const CONVERSATIONS_PER_PAGE = 30

  const {
    data: unreadConversationsCount = 0,
    isLoading: isLoadingUnreadConversationsCount,
    isFetching: isFetchingUnreadConversationsCount,
  } = useQuery({
    queryKey: ["conversations", "unreadCount"],
    queryFn: async () => {
      const res = await conversations.getUnreadCount()
      return res.data ?? 0
    },
    staleTime: 15_000,
  })

  const {
    data: conversationList,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversations", "list", CONVERSATIONS_PER_PAGE, deferredSearchQuery],
    queryFn: ({ pageParam = 1 }) =>
      conversations.getAll({
        page: pageParam,
        limit: CONVERSATIONS_PER_PAGE,
        search: deferredSearchQuery?.trim() ? deferredSearchQuery.trim() : undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
    select: (data) => data.pages.flatMap((p) => p.data?.items ?? []),
  })

  const list = conversationList ?? []

  const filtered = React.useMemo(() => {
    let next = list

    if (activeTab === "unread") {
      next = next.filter((c) => c.unreadCount > 0)
    }
    return next
  }, [list, activeTab])

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return

      const el = e.currentTarget
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) fetchNextPage()
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Hội thoại</h2>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <Icons.filter className="size-4" />
          </Button>
        </div>

        <div className="relative">
          <Icons.search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hội thoại..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="h-9 border-transparent bg-muted/50 pl-9 focus-visible:border-border"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 w-full bg-muted/70 p-0.5">
            <TabsTrigger value="all" className="h-7 flex-1 text-xs">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="unread" className="h-7 flex-1 gap-1 text-xs">
              Chưa đọc
              {unreadConversationsCount > 0 && (
                <Badge variant="secondary" className="size-5 bg-primary p-0 text-[10px] text-primary-foreground">
                  {unreadConversationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <Icons.messageSquare className="mb-2 size-8 opacity-50" />
            <p className="text-sm">Không có hội thoại nào</p>
          </div>
        ) : (
          filtered.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation)}
            />
          ))
        )}

        {isFetchingNextPage && hasNextPage && (
          <div className="flex justify-center py-2">
            <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
