"use client"

import { roles, type RoleListItem } from "@/api"
import { Icons } from "@/components/global/icons"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

const PAGE_SIZE = 20

type RoleLazySelectProps = {
  id?: string
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  ariaInvalid?: boolean
  selectedLabel?: string
}

export function RoleLazySelect({
  id,
  value,
  onValueChange,
  placeholder = "Chọn vai trò",
  ariaInvalid,
  selectedLabel,
}: RoleLazySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const currentValue = value?.trim() ?? ""

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["roles", "lazy-select", search],
    queryFn: ({ pageParam }) =>
      roles.getAll({
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

  const selectedRoleQuery = useQuery({
    queryKey: ["roles", "lazy-select", "by-id", currentValue],
    queryFn: () => roles.getById(currentValue as string),
    enabled: Boolean(currentValue),
    staleTime: 60_000,
  })

  const options = useMemo(() => {
    const map = new Map<string, RoleListItem>()

    const selectedRole = selectedRoleQuery.data?.data
    if (selectedRole) {
      map.set(selectedRole.id, selectedRole)
    }

    for (const page of data?.pages ?? []) {
      for (const role of page.data?.items ?? []) {
        if (!map.has(role.id)) {
          map.set(role.id, role)
        }
      }
    }
    return Array.from(map.values())
  }, [data?.pages, selectedRoleQuery.data?.data])

  const hasMore = !!hasNextPage
  const isLoadingMore = isFetchingNextPage
  const selectedRole = options.find((role) => role.id === currentValue)
  const selectedDisplay = selectedRole?.name ?? selectedLabel

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
          <span className="line-clamp-1 text-left">{selectedDisplay}</span>
        ) : (
          <SelectValue placeholder={isLoading ? "Đang tải vai trò..." : placeholder} />
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
            placeholder="Tìm theo tên vai trò"
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
            <div className="py-3 text-center text-xs text-muted-foreground">Đang tải vai trò...</div>
          ) : options.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">Không tìm thấy vai trò phù hợp.</div>
          ) : (
            options.map((role: RoleListItem) => (
              <SelectItem key={role.id} value={role.id} className="px-3 py-2">
                {role.name}
              </SelectItem>
            ))
          )}

          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Icons.spinner className="size-3.5 animate-spin" />
              Đang tải thêm...
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
