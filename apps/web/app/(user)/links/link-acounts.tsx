"use client"

import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { AddConnectionDialog } from "@/app/(user)/links/_components/add-connection-dialog"
import { Icons } from "@/components/global/icons"
import { LinkedAccountsStats } from "./_components/linked-accounts-stats"
import { NotFoundLink } from "./_components/not-found-link"
import { LinkedAccountCard } from "./_components/linked-account-card"
import { linkAccounts } from "@/api"
import { channelMeta, getProviderLabel } from "@/lib/helper"

export function LinkAcounts() {
  const [dialogOpen, setDialogOpen] = useState(false)
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
