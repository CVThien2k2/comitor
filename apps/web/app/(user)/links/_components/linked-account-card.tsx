"use client"

import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { Icons } from "@/components/global/icons"
import type { LinkAccountItem } from "@/lib/types/link-account"
import { channelMeta, formatTimestamp, getAvatarColor, getInitials, linkAccountStatusMeta } from "@/lib/helper"

export function LinkedAccountCard({ account }: { account: LinkAccountItem }) {
  const meta = channelMeta[account.provider]
  const statusMeta = linkAccountStatusMeta[account.status]
  const creatorName = account.createdByUser?.name || "Không rõ"
  const creatorAvatarColor = getAvatarColor(account.createdByUser?.id || account.createdBy || account.id)
  const accountAvatarColor = getAvatarColor(account.accountId || account.id || account.provider)

  return (
    <Card className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="relative space-y-5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center rounded-[20px] border border-border/60 bg-background shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
              <Image
                src={meta.iconSrc}
                alt={meta.label}
                width={28}
                height={28}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
                  {account.displayName || meta.label}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{meta.label}</span>
                <span className="size-1 rounded-full bg-border" />
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase">{account.provider}</span>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs", statusMeta.badgeClassName)}
          >
            <span className={cn("mr-1.5 inline-block size-1.5 rounded-full", statusMeta.dotClassName)} />
            {statusMeta.label}
          </Badge>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar size="lg" className="ring-4 ring-background">
                <AvatarImage src={account.avatarUrl ?? undefined} alt={account.displayName ?? meta.label} />
                <AvatarFallback className="font-medium text-white" style={{ backgroundColor: accountAvatarColor }}>
                  {getInitials(account.displayName ?? meta.label)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute right-0 bottom-0 size-3 rounded-full border-2 border-background",
                  statusMeta.dotClassName
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-muted-foreground">Định danh tài khoản</p>
              <p className="mt-1 truncate text-base font-semibold tracking-tight text-foreground">
                {account.accountId || "Chưa có mã định danh"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {account.accountId
                  ? "ID tài khoản/kênh đã được đồng bộ với hệ thống"
                  : "Tài khoản này chưa đồng bộ định danh hiển thị"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-border/60 bg-background p-3 transition-colors duration-300 group-hover:bg-muted/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icons.user className="size-3.5" />
              Tạo bởi
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-10 ring-1 ring-border/60">
                <AvatarFallback className="font-medium text-white" style={{ backgroundColor: creatorAvatarColor }}>
                  {getInitials(creatorName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{creatorName}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">Người tạo liên kết</p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-border/60 bg-background p-3 transition-colors duration-300 group-hover:bg-muted/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icons.clock className="size-3.5" />
              Cập nhật
            </div>
            <p className="mt-3 line-clamp-1 text-sm font-semibold text-foreground">
              {formatTimestamp(account.updatedAt)}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">Thời điểm cập nhật gần nhất</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
