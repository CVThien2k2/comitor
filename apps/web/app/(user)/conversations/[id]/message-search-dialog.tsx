"use client"

import { messagesApi } from "@/api/conversations"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { type UIEvent, useCallback, useMemo, useState } from "react"
import { useDebounce } from "use-debounce"

type MessageSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  onSelectMessage: (messageId: string) => void
}

const extractSnippetText = (value: string): string => {
  const raw = value?.trim()
  if (!raw) return ""

  const parseUnknown = (input: unknown): string => {
    if (typeof input === "string") return input.trim()
    if (Array.isArray(input)) {
      return input
        .flatMap((part) => {
          if (!part || typeof part !== "object") return []
          const text = (part as { text?: unknown }).text
          return typeof text === "string" && text.trim() ? [text.trim()] : []
        })
        .join(" ")
        .trim()
    }
    if (input && typeof input === "object") {
      const text = (input as { text?: unknown }).text
      if (typeof text === "string") return text.trim()
    }
    return ""
  }

  try {
    const parsed = JSON.parse(raw)
    const normalized = parseUnknown(parsed)
    if (normalized) return normalized
  } catch {
    // no-op: raw có thể đã là text thường
  }

  return raw.replace(/^"+|"+$/g, "").replace(/\\"/g, '"').trim()
}

export function MessageSearchDialog({ open, onOpenChange, conversationId, onSelectMessage }: MessageSearchDialogProps) {
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedSearch] = useDebounce(searchKeyword.trim(), 400)
  const normalizedKeyword = debouncedSearch.trim()
  const SEARCH_PAGE_LIMIT = 30
  const SEARCH_FETCH_THRESHOLD_PX = 180

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", "search", conversationId, normalizedKeyword, SEARCH_PAGE_LIMIT],
    enabled: open && normalizedKeyword.length > 0,
    queryFn: ({ pageParam }) =>
      messagesApi.searchInConversation(conversationId, {
        q: normalizedKeyword,
        limit: SEARCH_PAGE_LIMIT,
        cursorTime: pageParam?.time,
        cursorId: pageParam?.id,
      }),
    initialPageParam: null as { time: string; id: string } | null,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      return meta?.hasMore ? meta.nextCursor : undefined
    },
    select: (queryData) => {
      const seen = new Set<string>()
      return queryData.pages
        .flatMap((page) => page.data?.items ?? [])
        .filter((item) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
    },
  })

  const searchResults = useMemo(() => data ?? [], [data])
  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return
      const el = event.currentTarget
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distanceToBottom < SEARCH_FETCH_THRESHOLD_PX) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setSearchKeyword("")
      }}
    >
      <DialogContent className="top-1/2 flex h-[70vh] max-h-[70vh] -translate-y-1/2 flex-col gap-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tìm kiếm tin nhắn</DialogTitle>
        </DialogHeader>

        <Input
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="Nhập từ khóa..."
          autoFocus
        />

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/70" onScroll={handleScroll}>
          {normalizedKeyword.length === 0 ? (
            <p className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Nhập từ khóa để tìm nội dung tin nhắn
            </p>
          ) : isLoading ? (
            <p className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Đang tìm kiếm...
            </p>
          ) : searchResults.length === 0 ? (
            <p className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Không có kết quả phù hợp
            </p>
          ) : (
            <div className="divide-y divide-border/70">
              {searchResults.map((result: (typeof searchResults)[number]) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-none p-0 text-left hover:bg-muted/50"
                  onClick={() => onSelectMessage(result.id)}
                >
                  <div className="w-full space-y-1 p-3">
                    <p className="line-clamp-2 text-sm text-foreground">{extractSnippetText(result.snippet || "")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(result.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </Button>
              ))}
              {isFetchingNextPage && (
                <p className="p-3 text-center text-xs text-muted-foreground">Đang tải thêm kết quả...</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
