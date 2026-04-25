"use client"

import { Icons } from "@/components/global/icons"

type LinkedAccountsStatsProps = {
  totalCount: number
  activeCount: number
  providerCount: number
}

export function LinkedAccountsStats({ totalCount, activeCount, providerCount }: LinkedAccountsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="group rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-md">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Tổng tài khoản</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{totalCount}</p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:scale-105">
              <Icons.link className="size-5" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Đã liên kết vào hệ thống</p>
        </div>
      </div>

      <div className="group rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-md">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Đang hoạt động</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{activeCount}</p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:scale-105">
              <Icons.zap className="size-5" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Sẵn sàng tiếp nhận hội thoại</p>
        </div>
      </div>

      <div className="group rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-md">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Loại kênh</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{providerCount}</p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:scale-105">
              <Icons.sparkles className="size-5" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Phân bổ trên nhiều nền tảng</p>
        </div>
      </div>
    </div>
  )
}
