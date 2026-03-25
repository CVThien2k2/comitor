"use client"

import { conversations } from "@/api/conversations"
import { Icons } from "@/components/global/icons"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useAppStore } from "@/stores/app-store"
import { useChatStore } from "@/stores/chat-store"
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type UIEvent } from "react"
import { useShallow } from "zustand/react/shallow"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { ConversationItem } from "./conversation-item"

function ConversationListSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Conversation List Panel ────────────────────────────

export function ConversationListPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch] = useDebounce(searchQuery.trim(), 500)
  const [activeTab, setActiveTab] = useState("all")

  const CONVERSATIONS_PER_PAGE = 20

  const unreadConversationsCount = useAppStore((s) => s.badges.conversationsUnreadCount ?? 0)

  const {
    setConversations,
    appendConversations,
    conversations: filtered,
  } = useChatStore(
    useShallow((s) => ({
      setConversations: s.setConversations,
      appendConversations: s.appendConversations,
      conversations: s.conversations,
    }))
  )

  const lastSyncedPageCount = useRef(0)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["conversations", "list", CONVERSATIONS_PER_PAGE, debouncedSearch, activeTab],
    queryFn: ({ pageParam = 1 }) =>
      conversations.getAll({
        page: pageParam,
        limit: CONVERSATIONS_PER_PAGE,
        search: debouncedSearch || undefined,
        unread: activeTab === "unread",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      return meta.page < meta.totalPages ? meta.page + 1 : undefined
    },
  })

  useEffect(() => {
    lastSyncedPageCount.current = 0
    setConversations([])
  }, [debouncedSearch, activeTab, setConversations])

  useEffect(() => {
    const pages = data?.pages
    if (!pages?.length) return

    if (pages.length === 1) {
      const items = pages[0]?.data?.items ?? []
      setConversations(items)
      lastSyncedPageCount.current = 1
      return
    }

    if (pages.length > lastSyncedPageCount.current) {
      const newPages = pages.slice(lastSyncedPageCount.current)
      for (const p of newPages) {
        appendConversations(p.data?.items ?? [])
      }
      lastSyncedPageCount.current = pages.length
    }
  }, [data?.pages, appendConversations, setConversations])

  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return

      const el = e.currentTarget
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 500) fetchNextPage()
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
            placeholder="Tìm kiếm hội thoại"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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
          <ConversationListSkeleton count={20} />
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <Icons.messageSquare className="mb-2 size-8 opacity-50" />
            <p className="text-sm">Không có hội thoại nào</p>
          </div>
        ) : (
          filtered.map((conversation) => <ConversationItem key={conversation.id} conversation={conversation} />)
        )}

        {isFetchingNextPage && hasNextPage && <ConversationListSkeleton count={5} />}
      </div>
    </div>
  )
}
