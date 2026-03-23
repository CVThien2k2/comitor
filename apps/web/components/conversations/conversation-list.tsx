"use client"

import type { ConversationItem } from "@/api/conversations"
import { conversations } from "@/api/conversations"
import { Icons } from "@/components/global/icons"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useAppStore } from "@/stores/app-store"
import * as React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ConversationListItem } from "./conversation-list-item"

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

  const unreadConversationsCount = useAppStore((s) => s.badges.conversationsUnreadCount ?? 0)

  const {
    data: conversationList,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversations", "list", CONVERSATIONS_PER_PAGE, deferredSearchQuery, activeTab],
    queryFn: ({ pageParam = 1 }) =>
      conversations.getAll({
        page: pageParam,
        limit: CONVERSATIONS_PER_PAGE,
        search: deferredSearchQuery?.trim() ? deferredSearchQuery.trim() : undefined,
        unread: activeTab === "unread",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
    select: (data) => data.pages.flatMap((p) => p.data?.items ?? []),
    // Chuyển tab đổi queryKey nên React Query sẽ fetch lại đúng tập dữ liệu từ BE.
    staleTime: 0,
  })

  const filtered = conversationList ?? []

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
