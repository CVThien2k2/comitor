"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "@workspace/ui/components/sonner"
import { AddConnectionDialog } from "@/app/(user)/links/_components/add-connection-dialog"
import { Icons } from "@/components/global/icons"
import { LinkedAccountsStats } from "./_components/linked-accounts-stats"
import { NotFoundLink } from "./_components/not-found-link"
import { LinkedAccountCard } from "./_components/linked-account-card"
import { ConnectMetaPayload, ConnectZaloOaPayload, linkAccounts } from "@/api"
import { channelMeta, getProviderLabel } from "@/lib/helper"

export function LinkAcounts() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handledZaloOaCallbackRef = useRef(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("all")

  const { data } = useSuspenseQuery({
    queryKey: ["link-accounts"],
    queryFn: async () => {
      const response = await linkAccounts.getAll()
      return response.data
    },
  })

  const accounts = data?.items ?? []

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
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"] })
    },
    onError: (error, _variables, context) => {
      toast.error(error?.message || "Kết nối Zalo OA thất bại", {
        id: context?.toastId,
      })
    },
    onSettled: () => {
      router.replace("/links")
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"] })
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
      void queryClient.invalidateQueries({ queryKey: ["link-accounts"] })
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
  }, [connectMeta, connectZaloOa, queryClient, router, searchParams])

  if (accounts.length === 0) return <NotFoundLink />

  const activeCount = accounts.filter((account) => account.status === "active").length
  const providerCount = new Set(accounts.map((account) => account.provider)).size
  const providers = Object.keys(channelMeta)

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

            <Button size="lg" className="shrink-0 rounded-2xl px-4" onClick={() => setDialogOpen(true)}>
              <Icons.plus className="size-4" />
              Thêm liên kết
            </Button>
          </div>

          <LinkedAccountsStats totalCount={accounts.length} activeCount={activeCount} providerCount={providerCount} />
          <div className="rounded-2xl border border-border/60 bg-card/70 p-3.5 md:p-4">
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <Icons.search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Tìm theo tên tài khoản, ID..."
                  className="h-10 rounded-xl border-border/70 bg-background pl-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={selectedProvider === "all" ? "default" : "outline"}
                  className="rounded-full px-3"
                  onClick={() => setSelectedProvider("all")}
                >
                  Tất cả
                </Button>
                {providers.map((provider) => (
                  <Button
                    key={provider}
                    type="button"
                    size="sm"
                    variant={selectedProvider === provider ? "default" : "outline"}
                    className="rounded-full px-3 capitalize"
                    onClick={() => setSelectedProvider(provider)}
                  >
                    {getProviderLabel(provider)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <LinkedAccountCard key={account.id} account={account} />
            ))}
          </div>
        </CardContent>
      </Card>

      <AddConnectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
