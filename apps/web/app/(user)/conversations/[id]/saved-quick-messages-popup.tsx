"use client"

import { suggestedMessages } from "@/api/suggested-messages"
import { Icons } from "@/components/global/icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import type { RefObject } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CreateSuggestedMessageDialog } from "./create-suggested-message-dialog"
import { UpdateSuggestedMessageDialog } from "./update-suggested-message-dialog"

export type QuickMessageListItem = {
  id: string
  tag: string
  message: string
}

export type SavedQuickMessagesPopupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyMessage: (text: string) => void
  items?: QuickMessageListItem[]
  isLoading?: boolean
  boundaryRef?: RefObject<HTMLElement | null>
  className?: string
}

const SUGGESTED_MESSAGES_LIMIT = 200

function ListSkeleton({ count }: { count: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="px-3 py-3">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function SavedQuickMessagesPopup({
  open,
  onOpenChange,
  onApplyMessage,
  items: itemsProp = [],
  isLoading = false,
  boundaryRef,
  className,
}: SavedQuickMessagesPopupProps) {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<"select" | "manage">("select")
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [updatingItem, setUpdatingItem] = useState<QuickMessageListItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<QuickMessageListItem | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const { data: suggestedRes, isLoading: suggestedLoading } = useQuery({
    queryKey: ["suggested-messages", "list", SUGGESTED_MESSAGES_LIMIT],
    queryFn: () => suggestedMessages.getAll({ page: 1, limit: SUGGESTED_MESSAGES_LIMIT }),
    staleTime: 60_000,
    enabled: open,
  })

  const source = useMemo<QuickMessageListItem[]>(() => {
    const rows = suggestedRes?.data?.items
    if (rows?.length) {
      return rows.map((row) => ({
        id: row.id,
        tag: row.tag,
        message: row.message,
      }))
    }
    return itemsProp
  }, [itemsProp, suggestedRes?.data?.items])

  const loading = suggestedLoading || (source.length === 0 && isLoading)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((item) => {
      const haystack = `${item.tag} ${item.message}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [query, source])

  const resetManagerState = useCallback(() => {
    setViewMode("select")
    setCreateOpen(false)
    setUpdatingItem(null)
    setDeletingItem(null)
    setQuery("")
  }, [])

  const closePopup = useCallback(() => {
    resetManagerState()
    onOpenChange(false)
  }, [onOpenChange, resetManagerState])

  const handleApply = useCallback(
    (text: string) => {
      onApplyMessage(text.trim())
      closePopup()
    },
    [closePopup, onApplyMessage]
  )

  const { mutateAsync: removeSuggestedMessage, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => suggestedMessages.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa tin nhắn nhanh.")
      void queryClient.invalidateQueries({ queryKey: ["suggested-messages"] })
    },
    onError: () => {
      toast.error("Không thể xóa tin nhắn nhanh.")
    },
  })

  const handleDelete = useCallback(
    (item: QuickMessageListItem) => {
      setDeletingItem(item)
    },
    []
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingItem) return
    try {
      await removeSuggestedMessage(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Toast is handled in mutation callbacks.
    }
  }, [deletingItem, removeSuggestedMessage])

  const isLayeredDialogOpen = Boolean(deletingItem || createOpen || updatingItem)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (deletingItem) {
        e.preventDefault()
        setDeletingItem(null)
        return
      }
      if (updatingItem) {
        e.preventDefault()
        setUpdatingItem(null)
        return
      }
      if (createOpen) {
        e.preventDefault()
        setCreateOpen(false)
        return
      }
      closePopup()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [closePopup, createOpen, deletingItem, open, updatingItem])

  const openManage = useCallback(() => {
    setViewMode("manage")
    setCreateOpen(false)
    setUpdatingItem(null)
    setDeletingItem(null)
    setQuery("")
  }, [])

  const backToSelect = useCallback(() => {
    setViewMode("select")
    setCreateOpen(false)
    setUpdatingItem(null)
    setDeletingItem(null)
    setQuery("")
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (isLayeredDialogOpen) return
      const popup = rootRef.current
      const boundary = boundaryRef?.current ?? null
      const target = e.target
      if (!(target instanceof Node)) return
      if (popup?.contains(target)) return
      if (boundary?.contains(target)) return
      closePopup()
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open, closePopup, boundaryRef, isLayeredDialogOpen])

  if (!open) return null

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Tin nhắn nhanh đã lưu"
      className={cn(
        "absolute bottom-full left-0 z-50 mb-2 flex max-h-[min(70vh,24rem)] w-[min(100vw-1rem,28rem)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg",
        className
      )}
    >
      {viewMode === "select" ? (
        <>
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Tin nhắn nhanh đã lưu</h3>
            <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={openManage}>
              Quản lý
            </button>
          </div>

          <div className="shrink-0 border-b border-border px-3 py-2">
            <div className="relative">
              <Icons.search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tag hoặc nội dung"
                className="h-9 pl-9 text-sm"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <ListSkeleton count={5} />
            ) : filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {source.length === 0 ? "Chưa có tin nhắn nhanh nào" : "Không có tin nhắn phù hợp"}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-inset"
                      onClick={() => handleApply(item.message)}
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-mono text-xs font-semibold text-foreground">/{item.tag}</p>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{item.message}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="ghost" size="icon-sm" className="size-7" onClick={backToSelect}>
                <Icons.chevronLeft className="size-4" />
              </Button>
              <h3 className="text-sm font-semibold text-foreground">Quản lý tin nhắn nhanh</h3>
            </div>
            <Button type="button" size="sm" className="h-7 text-xs" onClick={() => setCreateOpen(true)}>
                Tạo mới
            </Button>
          </div>

          <div className="shrink-0 border-b border-border px-3 py-2">
            <div className="relative">
              <Icons.search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tag hoặc nội dung"
                className="h-9 pl-9 text-sm"
                disabled={loading || isDeleting}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <ListSkeleton count={5} />
            ) : filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {source.length === 0 ? "Chưa có tin nhắn nhanh nào" : "Không có tin nhắn phù hợp"}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => (
                  <li key={item.id} className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-mono text-xs font-semibold text-foreground">/{item.tag}</p>
                        <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                          {item.message}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={isDeleting}
                          onClick={() => setUpdatingItem(item)}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={isDeleting}
                          onClick={() => handleDelete(item)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <AlertDialog open={Boolean(deletingItem)} onOpenChange={(nextOpen) => !nextOpen && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nhắn nhanh này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa tag <strong>{deletingItem ? `/${deletingItem.tag}` : ""}</strong>. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeletingItem(null)}>
              Hủy
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <Icons.spinner className="size-4 animate-spin" /> : null}
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateSuggestedMessageDialog open={createOpen} onOpenChange={setCreateOpen} />
      <UpdateSuggestedMessageDialog open={Boolean(updatingItem)} item={updatingItem} onOpenChange={(nextOpen) => !nextOpen && setUpdatingItem(null)} />
    </div>
  )
}
