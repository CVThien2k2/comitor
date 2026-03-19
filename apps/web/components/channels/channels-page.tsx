"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import { useLinkAccounts, useDeleteLinkAccount } from "@/hooks/use-linked-accounts"
import { AddConnectionDialog } from "./add-connection-dialog"
import type { LinkAccountItem, ChannelType } from "@workspace/shared"

const channelConfig: Record<string, {
  icon: React.ReactNode
  label: string
  color: string
  bgLight: string
  textColor: string
}> = {
  zalo_oa: {
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="12" fill="#0068FF"/>
        <path d="M32.5 15.5H15.5C14.12 15.5 13 16.62 13 18V30C13 31.38 14.12 32.5 15.5 32.5H20.5L24 36L27.5 32.5H32.5C33.88 32.5 35 31.38 35 30V18C35 16.62 33.88 15.5 32.5 15.5ZM19.5 27H17V24.5H19.5V27ZM19.5 23H17V20.5H19.5V23ZM26.25 27H21.75V24.5H26.25V27ZM26.25 23H21.75V20.5H26.25V23ZM31 27H28.5V24.5H31V27ZM31 23H28.5V20.5H31V23Z" fill="white"/>
      </svg>
    ),
    label: "Zalo OA",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  zalo_personal: {
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="12" fill="#0068FF"/>
        <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14ZM24 19C25.66 19 27 20.34 27 22C27 23.66 25.66 25 24 25C22.34 25 21 23.66 21 22C21 20.34 22.34 19 24 19ZM24 31.2C21.5 31.2 19.29 29.92 18 27.98C18.03 25.99 22 24.9 24 24.9C25.99 24.9 29.97 25.99 30 27.98C28.71 29.92 26.5 31.2 24 31.2Z" fill="white"/>
      </svg>
    ),
    label: "Zalo Cá nhân",
    color: "from-blue-400 to-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-900/30",
    textColor: "text-blue-500 dark:text-blue-400",
  },
  facebook: {
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <defs>
          <linearGradient id="fbGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#00C6FF"/>
            <stop offset="100%" stopColor="#0078FF"/>
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#fbGradient)"/>
        <path d="M34.48 24.36L33.06 32.96C33.01 33.28 32.76 33.53 32.44 33.58C32.38 33.59 32.31 33.59 32.25 33.57L27.29 32.19C27.05 32.12 26.83 31.98 26.68 31.78L23.97 28.14L21.28 31.84C21.14 32.04 20.92 32.18 20.68 32.25L15.72 33.71C15.39 33.81 15.04 33.68 14.85 33.4C14.76 33.26 14.72 33.1 14.73 32.93L15.3 24.39C15.33 24.03 15.57 23.73 15.91 23.62L20.45 22.16L24 17L27.55 22.13L32.1 23.54C32.44 23.64 32.69 23.94 32.72 24.3L34.48 24.36Z" fill="white"/>
      </svg>
    ),
    label: "Facebook Page",
    color: "from-blue-500 to-purple-500",
    bgLight: "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  gmail: {
    icon: <Icons.mail className="w-7 h-7 text-slate-400" />,
    label: "Email",
    color: "from-slate-400 to-slate-500",
    bgLight: "bg-slate-50 dark:bg-slate-900/30",
    textColor: "text-slate-500",
  },
  phone: {
    icon: <Icons.phone className="w-7 h-7 text-emerald-400" />,
    label: "Tổng đài",
    color: "from-emerald-400 to-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-900/30",
    textColor: "text-emerald-500",
  },
}

const defaultConfig = {
  icon: <Icons.globe className="w-7 h-7 text-muted-foreground" />,
  label: "Kênh",
  color: "from-muted to-muted",
  bgLight: "bg-muted/50",
  textColor: "text-muted-foreground",
}

function getChannelConfig(provider: string) {
  return channelConfig[provider] ?? defaultConfig
}

const providerLabel: Record<ChannelType, string> = {
  zalo_oa: "Zalo OA",
  zalo_personal: "Zalo Cá nhân",
  facebook: "Facebook Page",
  gmail: "Email",
  phone: "Phone",
}

interface DisconnectedChannel {
  type: string
  name: string
  description: string
  comingSoon?: boolean
}

const disconnectedChannels: DisconnectedChannel[] = [
  { type: "gmail", name: "Email", description: "Kết nối email để nhận và gửi email hỗ trợ" },
  { type: "phone", name: "Tổng đài Stringee", description: "Tích hợp tổng đài điện thoại", comingSoon: true },
]

// ─── Sub-components ───────────────────────────────────────

function ConnectedChannelCard({
  account,
  onDisconnect,
}: {
  account: LinkAccountItem
  onDisconnect: (id: string) => void
}) {
  const config = getChannelConfig(account.provider)
  const createdAt = new Date(account.createdAt)
  const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="group relative bg-card rounded-xl border-2 border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300">
      <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r", config.color)} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl", config.bgLight)}>
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{account.displayName || config.label}</h3>
                <Icons.checkCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className={cn("text-sm font-medium", config.textColor)}>
                {providerLabel[account.provider] ?? account.provider}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-medium gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
            Đang hoạt động
          </Badge>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {account.accountId && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Icons.zap className="w-3 h-3" />
              ID: {account.accountId}
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1 text-xs">
            <Icons.clock className="w-3 h-3" />
            Kết nối {daysSinceCreated} ngày trước
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Icons.user className="w-3 h-3" />
            Bởi {account.linkedByUser.name}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-border/50">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Icons.settings className="w-4 h-4" />
            Cấu hình
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDisconnect(account.id)}
          >
            <Icons.unplug className="w-4 h-4" />
            Ngắt kết nối
          </Button>
        </div>
      </div>
    </div>
  )
}

function DisconnectedChannelCard({ channel }: { channel: DisconnectedChannel }) {
  const config = getChannelConfig(channel.type)

  return (
    <div className="relative bg-card rounded-xl border-2 border-dashed border-border/70 hover:border-muted-foreground/30 transition-all duration-300 opacity-80 hover:opacity-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-muted-foreground">{channel.name}</h3>
                {channel.comingSoon && (
                  <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 text-[10px]">
                    Sắp ra mắt
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground/70">{channel.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-6 mb-4 rounded-lg bg-muted/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-2">
              <Icons.unplug className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground/70">Chưa kết nối</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          {channel.comingSoon ? (
            <Button variant="secondary" size="sm" className="w-full gap-2" disabled>
              <Icons.clock className="w-4 h-4" />
              Sắp ra mắt
            </Button>
          ) : (
            <Button variant="default" size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90">
              <Icons.plus className="w-4 h-4" />
              Kết nối ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryStats({ accounts }: { accounts: LinkAccountItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-xl border border-primary/10 mb-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icons.checkCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
          <p className="text-sm text-muted-foreground">kênh đã kết nối</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Icons.users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {accounts.filter((a) => a.provider === "zalo_oa" || a.provider === "zalo_personal").length}
          </p>
          <p className="text-sm text-muted-foreground">kênh Zalo</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Icons.globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {accounts.filter((a) => a.provider === "facebook").length}
          </p>
          <p className="text-sm text-muted-foreground">kênh Facebook</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────

export function ChannelsPage() {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { data, isLoading, isError } = useLinkAccounts({ page, limit: 20, search: search || undefined })
  const deleteAccount = useDeleteLinkAccount()

  const accounts = data?.items ?? []
  const meta = data?.meta

  const handleDisconnect = (id: string) => {
    if (!confirm("Bạn có chắc muốn ngắt kết nối kênh này?")) return
    deleteAccount.mutate(id, {
      onSuccess: () => toast.success("Đã ngắt kết nối kênh"),
      onError: () => toast.error("Không thể ngắt kết nối kênh"),
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-8 py-6 border-b border-border/50 bg-card/50">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Kênh kết nối</h1>
          <p className="text-muted-foreground mt-0.5">Quản lý kết nối các kênh giao tiếp</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-sm" onClick={() => setDialogOpen(true)}>
          <Icons.plus className="w-4 h-4" />
          Thêm kênh
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          {/* Search */}
          <div className="relative mb-6">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm kênh..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full max-w-sm pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Icons.spinner className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Icons.xCircle className="w-10 h-10 text-destructive" />
              <p className="text-muted-foreground">Không thể tải danh sách kênh kết nối</p>
            </div>
          )}

          {/* Data loaded */}
          {!isLoading && !isError && (
            <>
              {/* Summary stats */}
              <SummaryStats accounts={accounts} />

              {/* Connected channels */}
              {accounts.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <Icons.checkCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Đã kết nối</h2>
                    <Badge variant="secondary" className="ml-1">{meta?.total ?? accounts.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {accounts.map((account) => (
                      <ConnectedChannelCard key={account.id} account={account} onDisconnect={handleDisconnect} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {accounts.length === 0 && !search && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 mb-10">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
                    <Icons.unplug className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Chưa có kênh nào được kết nối</p>
                    <p className="text-sm text-muted-foreground mt-1">Bấm &quot;Thêm kênh&quot; để bắt đầu</p>
                  </div>
                  <Button onClick={() => setDialogOpen(true)} className="gap-2">
                    <Icons.plus className="w-4 h-4" />
                    Thêm kênh
                  </Button>
                </div>
              )}

              {/* No search results */}
              {accounts.length === 0 && search && (
                <div className="flex flex-col items-center justify-center py-16 gap-2 mb-10">
                  <Icons.search className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Không tìm thấy kênh nào cho &quot;{search}&quot;</p>
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-10">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <Icons.chevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {meta.page} / {meta.totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                    <Icons.chevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Disconnected channels */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                    <Icons.alertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Chưa kết nối</h2>
                  <Badge variant="secondary" className="ml-1">{disconnectedChannels.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {disconnectedChannels.map((channel) => (
                    <DisconnectedChannelCard key={channel.type} channel={channel} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AddConnectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
