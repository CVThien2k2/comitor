"use client"

import { conversations } from "@/api/conversations"
import { Icons } from "@/components/global/icons"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useAppStore } from "@/stores/app-store"
import { useChatStore } from "@/stores/chat-store"
import { useConversations } from "@/hooks/use-conversations"
import { ROUTES } from "@/lib/routes"
import type { ConversationItem as ConversationItemType } from "@/lib/types"
import { useCallback, useEffect, useState, type ChangeEvent, type UIEvent } from "react"
import { useShallow } from "zustand/react/shallow"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { useRouter } from "next/navigation"
import { ConversationItem } from "./conversation-item"

type ConversationCursorParam = {
  cursorLastActivityAt: string
  cursorId: string
}

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
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch] = useDebounce(searchQuery.trim(), 500)
  const [activeTab, setActiveTab] = useState("all")

  const CONVERSATIONS_PER_PAGE = 20

  const { markAsRead } = useConversations()

  const unreadConversationsCount = useAppStore((s) => s.badges.conversationsUnreadCount ?? 0)

  const {
    setConversations,
    conversations: filtered,
  } = useChatStore(
    useShallow((s) => ({
      setConversations: s.setConversations,
      conversations: s.conversations,
    }))
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["conversations", "list", CONVERSATIONS_PER_PAGE, debouncedSearch, activeTab],
    queryFn: ({ pageParam }) =>
      conversations.getAll({
        limit: CONVERSATIONS_PER_PAGE,
        search: debouncedSearch || undefined,
        unread: activeTab === "unread",
        myProcessing: activeTab === "received",
        cursorLastActivityAt: pageParam?.cursorLastActivityAt,
        cursorId: pageParam?.cursorId,
      }),
    initialPageParam: null as ConversationCursorParam | null,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta?.hasMore || !meta.nextCursor) return undefined
      return {
        cursorLastActivityAt: meta.nextCursor.lastActivityAt,
        cursorId: meta.nextCursor.id,
      }
    },
  })

  useEffect(() => {
    setConversations([])
  }, [debouncedSearch, activeTab, setConversations])

  useEffect(() => {
    const items = data?.pages.flatMap((page) => page.data?.items ?? []) ?? []
    setConversations(items)
  }, [data?.pages, setConversations])

  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return

      const el = e.currentTarget
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 500) fetchNextPage()
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  const handleConversationClick = useCallback(
    (conversation: ConversationItemType) => {
      if (conversation.countUnreadMessages > 0) {
        markAsRead(conversation.id)
      }
      router.push(ROUTES.conversationDetail.path.replace(":id", conversation.id))
    },
    [markAsRead, router]
  )

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icons.search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm hội thoại"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="h-9 border-transparent bg-muted/50 pl-9 focus-visible:border-border"
            />
          </div>
          <Button variant="ghost" className="bg-muted/50 text-muted-foreground">
            <Icons.filter className="size-4" />
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 w-full bg-muted/70 p-0.5">
            <TabsTrigger value="all" className="h-7 flex-1 text-xs">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="received" className="h-7 flex-1 text-xs">
              Đã nhận
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
          filtered.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} onClick={handleConversationClick} />
          ))
        )}

        {isFetchingNextPage && hasNextPage && <ConversationListSkeleton count={5} />}
      </div>
    </div>
  )
}
