"use client"

import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { AddConnectionDialog } from "@/app/(user)/links/_components/add-connection-dialog"
import { Icons } from "@/components/global/icons"
import type { LinkAccountItem } from "@/lib/types/link-account"
import { LinkedAccountsStats } from "./_components/linked-accounts-stats"
import { NotFoundLink } from "./_components/not-found-link"
import { LinkedAccountCard } from "./_components/linked-account-card"

const MOCK_LINKED_ACCOUNTS: LinkAccountItem[] = [
  {
    id: "link-01",
    provider: "facebook",
    displayName: "Meta Sales Inbox",
    accountId: "meta.sales.01",
    avatarUrl: null,
    status: "active",
    createdBy: "user-01",
    createdByUser: { id: "user-01", name: "Thiên Cao", avatarUrl: null },
    createdAt: "2026-04-20T08:00:00.000Z",
    updatedAt: "2026-04-25T08:55:00.000Z",
  },
  {
    id: "link-02",
    provider: "zalo_oa",
    displayName: "Zalo OA Comitor",
    accountId: "zalo-oa-8821",
    avatarUrl: null,
    status: "active",
    createdBy: "user-02",
    createdByUser: { id: "user-02", name: "Hà Trần", avatarUrl: null },
    createdAt: "2026-04-18T09:10:00.000Z",
    updatedAt: "2026-04-25T07:15:00.000Z",
  },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function LinkAcounts() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: accounts } = useSuspenseQuery({
    queryKey: ["link-accounts", "mock-list"],
    queryFn: async () => {
      await sleep(1000)
      return MOCK_LINKED_ACCOUNTS
    },
  })

  if (accounts.length === 0) return <NotFoundLink />

  const activeCount = accounts.filter((account) => account.status === "active").length
  const providerCount = new Set(accounts.map((account) => account.provider)).size

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
