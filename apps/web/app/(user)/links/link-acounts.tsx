"use client"

import { ConnectMetaPayload, ConnectZaloOaPayload, linkAccounts } from "@/api"
import { AddConnectionDialog } from "@/app/(user)/links/_components/add-connection-dialog"
import { ConfirmDialog } from "@/components/global/confirm-dialog"
import { Icons } from "@/components/global/icons"
import { useHasPermission } from "@/hooks/use-has-permission"
import type { LinkAccountItem } from "@/lib/types/link-account"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ChannelType } from "@workspace/database"
import { P } from "@workspace/database/permissions"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "@workspace/ui/components/sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LinkedAccountCard } from "./_components/linked-account-card"
import { LinkedAccountsFilter } from "./_components/linked-accounts-filter"
import { LinkedAccountsGridSkeleton } from "./_components/linked-accounts-grid-skeleton"
import { LinkedAccountsStats } from "./_components/linked-accounts-stats"

const PAGE_SIZE = 18

export function LinkAcounts() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LinkAccountItem | null>(null)
  const handledZaloOaCallbackRef = useRef(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const [search, setSearch] = useState("")
  const [provider, setProvider] = useState<"all" | ChannelType>("all")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const canCreateLinkAccount = useHasPermission(P.LINK_ACCOUNT_CREATE)
  const canUpdateLinkAccount = useHasPermission(P.LINK_ACCOUNT_UPDATE)
  const canDeleteLinkAccount = useHasPermission(P.LINK_ACCOUNT_DELETE)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["link-accounts", debouncedSearch, provider],
    queryFn: async ({ pageParam = 1 }) => {
      return await linkAccounts.getAll({
        page: pageParam,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        provider: provider === "all" ? undefined : provider,
      })
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta
      if (!meta) return undefined
      const { page, totalPages } = meta
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
  })

  const accounts = useMemo(() => data?.pages.flatMap((page) => page.data?.items ?? []) ?? [], [data?.pages])

  const { mutate: deleteLinkAccount, isPending: isDeletingLinkAccount } = useMutation({
    mutationFn: (id: string) => linkAccounts.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa liên kết kênh thành công")
      setDeleteTarget(null)

      void queryClient.invalidateQueries({ queryKey: ["link-accounts"], exact: false })
    },
    onError: (error) => {
      toast.error(error?.message || "Xóa liên kết kênh thất bại")
    },
  })

  const {
    mutate: reconnectLinkAccount,
    isPending: isReconnectingLinkAccount,
    variables: reconnectingId,
  } = useMutation({
    mutationFn: (id: string) => linkAccounts.reconnect(id),
    onMutate: () => {
      const toastId = toast.loading("Đang reconnect tài khoản...")
      return { toastId }
    },
    onSuccess: (response, _variables, context) => {
      toast.success(response.message || "Reconnect tài khoản thành công", {
        id: context?.toastId,
      })
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"], exact: false })
    },
    onError: (error, _variables, context) => {
      toast.error(error?.message || "Reconnect tài khoản thất bại", {
        id: context?.toastId,
      })
    },
  })

  const {
    mutate: disconnectLinkAccount,
    isPending: isDisconnectingLinkAccount,
    variables: disconnectingId,
  } = useMutation({
    mutationFn: (id: string) => linkAccounts.disconnect(id),
    onMutate: () => {
      const toastId = toast.loading("Đang tắt tài khoản...")
      return { toastId }
    },
    onSuccess: (response, _variables, context) => {
      toast.success(response.message || "Tắt tài khoản thành công", {
        id: context?.toastId,
      })
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"], exact: false })
    },
    onError: (error, _variables, context) => {
      toast.error(error?.message || "Tắt tài khoản thất bại", {
        id: context?.toastId,
      })
    },
  })

  const handleDelete = useCallback(
    (id: string) => {
      const account = accounts.find((item) => item.id === id)
      if (account) setDeleteTarget(account)
    },
    [accounts]
  )

  const handleDisconnect = useCallback(
    (id: string) => {
      disconnectLinkAccount(id)
    },
    [disconnectLinkAccount]
  )

  const handleReconnect = useCallback(
    (id: string) => {
      reconnectLinkAccount(id)
    },
    [reconnectLinkAccount]
  )

  const handleCloseDeleteDialog = useCallback(() => {
    if (isDeletingLinkAccount) return
    setDeleteTarget(null)
  }, [isDeletingLinkAccount])

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return
    deleteLinkAccount(deleteTarget.id)
  }, [deleteLinkAccount, deleteTarget])

  const { mutateAsync: connectZaloOa } = useMutation({
    mutationFn: (payload: ConnectZaloOaPayload) => linkAccounts.connectZaloOa(payload),
    onMutate: () => {
      const toastId = toast.loading("Đang kết nối Zalo OA...")
      return { toastId }
    },
    onSuccess: (response, _variables, context) => {
      toast.success(response.message || "Kết nối Zalo OA thành công", {
        id: context?.toastId,
      })
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"], exact: false })
    },
    onError: (error, _variables, context) => {
      toast.error(error?.message || "Kết nối Zalo OA thất bại", {
        id: context?.toastId,
      })
    },
    onSettled: () => {
      router.replace("/links")
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"], exact: false })
    },
  })

  const handledMetaCallbackRef = useRef(false)
  const { mutateAsync: connectMeta } = useMutation({
    mutationFn: (payload: ConnectMetaPayload) => linkAccounts.connectMeta(payload),
    onMutate: () => {
      const toastId = toast.loading("Đang kết nối Facebook...")
      return { toastId }
    },
    onSuccess: (response, _variables, context) => {
      toast.success(response.message || "Kết nối Facebook thành công", {
        id: context?.toastId,
      })
    },
    onError: (error, _variables, context) => {
      toast.error(error?.message || "Kết nối Facebook thất bại", {
        id: context?.toastId,
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"], exact: false })
      router.replace("/links")
    },
  })

  useEffect(() => {
    const code = searchParams.get("code")
    const oaId = searchParams.get("oa_id")
    const state = searchParams.get("state")

    const error = searchParams.get("error")
    const errorReason = searchParams.get("error_reason")

    //Xử lý người dùng hủy cấp quyền Facebook
    if (state === "facebook" && error === "access_denied" && errorReason === "user_denied") {
      if (!handledMetaCallbackRef.current) {
        handledMetaCallbackRef.current = true
        toast.error("Bạn đã hủy kết nối Facebook")
      }
      router.replace("/links")
      return
    }

    //Xử lý callback từ Zalo OA
    if (code && oaId && !handledZaloOaCallbackRef.current) {
      connectZaloOa({ code, oaId })
      handledZaloOaCallbackRef.current = true
      return
    }

    //Xử lý callback từ Facebook
    if (code && state === "facebook" && !handledMetaCallbackRef.current) {
      connectMeta({ code })
      handledMetaCallbackRef.current = true
      return
    }

    //Xử lý lỗi từ Zalo OA
    const provider = searchParams.get("provider")
    const status = searchParams.get("status")
    const message = searchParams.get("message")
    if (!provider || !status) return
    handledMetaCallbackRef.current = true
    if (status === "success") toast.success(message || "Kết nối Zalo OA thành công")
    else if (status === "error") toast.error(message || "Kết nối Zalo OA thất bại")

    router.replace("/links")
  }, [connectMeta, connectZaloOa, router, searchParams])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: "240px" }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, accounts.length])

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-border/60 bg-background py-0 shadow-sm">
        <CardContent className="space-y-6 p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="space-y-2">
                <h2 className="max-w-xl text-xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Danh sách tài khoản đã kết nối
                </h2>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Theo dõi nhanh tổng số tài khoản, trạng thái hoạt động và số lượng kênh đang sử dụng.
                </p>
              </div>
            </div>
            {canCreateLinkAccount && (
              <Button
                size="lg"
                className="shrink-0 rounded-2xl px-4"
                onClick={() => {
                  setDialogOpen(true)
                }}
              >
                <Icons.plus className="size-4" />
                Thêm liên kết
              </Button>
            )}
          </div>

          <LinkedAccountsStats />
          <LinkedAccountsFilter
            filter={{ search, provider }}
            onFilterChange={(value) => {
              if (value.search !== undefined) setSearch(value.search)
              if (value.provider !== undefined) setProvider(value.provider)
            }}
          />
          <Separator />
          {isLoading ? (
            <LinkedAccountsGridSkeleton />
          ) : accounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => (
                <LinkedAccountCard
                  key={account.id}
                  account={account}
                  canDelete={canDeleteLinkAccount}
                  canUpdate={canUpdateLinkAccount}
                  isDeleting={isDeletingLinkAccount && deleteTarget?.id === account.id}
                  isDisconnecting={isDisconnectingLinkAccount && disconnectingId === account.id}
                  isReconnecting={isReconnectingLinkAccount && reconnectingId === account.id}
                  onDelete={handleDelete}
                  onDisconnect={handleDisconnect}
                  onReconnect={handleReconnect}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
              Không có tài khoản nào được liên kết.
            </div>
          )}
          <div ref={loadMoreRef} />
          {isFetchingNextPage ? <LinkedAccountsGridSkeleton /> : null}
        </CardContent>
      </Card>
      {canCreateLinkAccount && (
        <AddConnectionDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
          }}
        />
      )}
      {canDeleteLinkAccount && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={handleCloseDeleteDialog}
          title="Xóa liên kết kênh"
          message={
            deleteTarget
              ? `Tài khoản ${deleteTarget.displayName || deleteTarget.accountId || "Unknown"} sẽ bị xóa khỏi danh sách liên kết.`
              : ""
          }
          confirmText="Xóa"
          variant="danger"
          isLoading={isDeletingLinkAccount}
          loadingText="Đang xóa liên kết..."
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
