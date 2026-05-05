"use client"

import { agentLevels, type AgentLevelListItem } from "@/api"
import { Icons } from "@/components/global/icons"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

const PAGE_SIZE = 20

type AgentLevelLazySelectProps = {
  id?: string
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  ariaInvalid?: boolean
  selectedLabel?: string
}

export function AgentLevelLazySelect({
  id,
  value,
  onValueChange,
  placeholder = "Chọn cấp độ nhân viên",
  ariaInvalid,
  selectedLabel,
}: AgentLevelLazySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const currentValue = value?.trim() ?? ""

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["agent-levels", "lazy-select", search],
    queryFn: ({ pageParam }) =>
      agentLevels.getAll({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta || meta.page >= meta.totalPages) return undefined
      return meta.page + 1
    },
    enabled: open,
  })

  const selectedLevelQuery = useQuery({
    queryKey: ["agent-levels", "lazy-select", "by-id", currentValue],
    queryFn: () => agentLevels.getById(currentValue as string),
    enabled: Boolean(currentValue),
    staleTime: 60_000,
  })

  const options = useMemo(() => {
    const map = new Map<string, AgentLevelListItem>()
    const selectedLevel = selectedLevelQuery.data?.data
    if (selectedLevel) {
      map.set(selectedLevel.id, selectedLevel)
    }
    for (const page of data?.pages ?? []) {
      for (const level of page.data?.items ?? []) {
        if (!map.has(level.id)) {
          map.set(level.id, level)
        }
      }
    }
    return Array.from(map.values())
  }, [data?.pages, selectedLevelQuery.data?.data])

  const hasMore = !!hasNextPage
  const isLoadingMore = isFetchingNextPage
  const selectedLevel = options.find((level) => level.id === currentValue)
  const selectedDisplay = selectedLevel
    ? `${selectedLevel.code} - ${selectedLevel.yearsOfExperience} năm`
    : selectedLabel

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
      if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoadingMore) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasMore, isLoadingMore]
  )

  return (
    <Select value={currentValue} onOpenChange={setOpen} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="h-10 w-full px-3" aria-invalid={ariaInvalid}>
        {selectedDisplay ? (
          <span className="text-left">{selectedDisplay}</span>
        ) : (
          <SelectValue placeholder={isLoading ? "Đang tải cấp độ" : placeholder} />
        )}
      </SelectTrigger>

      <SelectContent
        position="popper"
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-(--radix-select-trigger-width)"
      >
        <div className="sticky top-0 z-10 border-b bg-popover p-3">
          <Input
            value={search}
            placeholder="Tìm theo tên cấp độ"
            onChange={(event) => setSearch(event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Escape") {
                event.stopPropagation()
              }
            }}
            className="h-9"
          />
        </div>

        <div onScroll={handleScroll} className="max-h-[220px] overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="py-3 text-center text-xs text-muted-foreground">Đang tải cấp độ nhân viên...</div>
          ) : options.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              Không tìm thấy cấp độ nhân viên phù hợp.
            </div>
          ) : (
            options.map((level: AgentLevelListItem) => (
              <SelectItem key={level.id} value={level.id} className="px-3 py-2">
                {level.code} - {level.yearsOfExperience} năm
              </SelectItem>
            ))
          )}

          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Icons.spinner className="size-3.5 animate-spin" />
              Đang tải thêm
            </div>
          ) : null}

          {!isLoadingMore && hasMore && options.length > 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">Cuộn xuống để tải thêm</div>
          ) : null}
        </div>
      </SelectContent>
    </Select>
  )
}
