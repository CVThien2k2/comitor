"use client"

import { LinkAccount } from "@workspace/database"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useState } from "react"
import { Icons } from "../global/icons"
import StatItem from "./stat_item"
import StatusBadge from "./status_badge"
import ChannelCardActions from "./channel-card-actions"

type ChannelActionHandler = (channelId: string) => Promise<unknown> | void

interface IProp {
  channelConfig: any
  channel: LinkAccount
  onClickDisconnect?: ChannelActionHandler
  onClickReconnect?: ChannelActionHandler
  onClickDelete?: ChannelActionHandler
  disconnectingChannelId?: string | null
  reconnectingChannelId?: string | null
  deletingChannelId?: string | null
}

const ConnectedChannelCard: React.FC<IProp> = ({
  channelConfig,
  channel,
  onClickDisconnect,
  onClickReconnect,
  onClickDelete,
  disconnectingChannelId,
  reconnectingChannelId,
  deletingChannelId,
}: IProp) => {
  const config = channelConfig[channel.provider]
  const [showActions, setShowActions] = useState<boolean>(false)

  const mapProviderName = (provider: string) => {
    switch (provider) {
      case "zalo_oa":
        return "Zalo OA"
      case "zalo_personal":
        return "Zalo cá nhân"
      case "facebook":
        return "Facebook"
      case "gmail":
        return "Email"
      case "stringee":
        return "Stringee"
      default:
        return provider
    }
  }

  return (
    <div className="group relative rounded-xl border-2 border-t-2 border-primary/20 border-t-emerald-500 bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      {/* Active indicator bar */}
      <div className={cn("absolute top-0 right-0 left-0 h-1 rounded-t-xl bg-gradient-to-r", config.color)} />

      <div className="flex flex-col gap-2 p-5 md:p-6">
        {/* Header - Responsive */}
        <div className="hidden md:block">
          <StatusBadge status={channel.status === "active" ? "active" : "error"} />
        </div>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", config.bgLight)}>
              {config.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-semibold text-foreground dark:text-zinc-100">
                  {mapProviderName(channel.provider)}
                </h3>
                <Icons.checkCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              </div>
              <p className={cn("truncate text-sm font-medium", config.textColor)}>{channel.displayName}</p>
            </div>
          </div>
        </div>

        {/* Status Badge - Mobile */}
        <div className="mb-4 md:hidden">
          <StatusBadge status={channel.status === "active" ? "active" : "error"} />
        </div>

        {/* Stats - Responsive Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 md:mb-5 md:grid-cols-2 md:gap-4 md:p-4 dark:bg-zinc-800/30">
          <StatItem icon={Icons.messageCircle} value={100} label="tin/ngày" />
          <StatItem icon={Icons.messagesSquare} value={100} label="hội thoại mở" />
        </div>

        {/* Metadata - Compact on mobile */}
        <div className="mb-4 flex flex-wrap gap-1.5 md:mb-5 md:gap-2">
          {channel !== undefined && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 text-xs"
                // channel.metadata.tokenDaysLeft <= 7 &&
                //   "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
              )}
            >
              <Icons.clock className="h-3 w-3" />
              Token còn 1 ngày
            </Badge>
          )}
          {channel.updatedAt && (
            <Badge
              variant="secondary"
              className="gap-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Icons.clock className="h-3 w-3" />
              Session{" "}
              {channel.createdAt
                ? `cập nhật ${Math.floor((Date.now() - new Date(channel.createdAt).getTime()) / (1000 * 60 * 60))} giờ trước`
                : "chưa cập nhật"}
            </Badge>
          )}
          {(channel.provider === "zalo_oa" || channel.provider === "facebook") && (
            <Badge
              variant="secondary"
              className="gap-1 border-emerald-200 bg-emerald-100 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
            >
              <Icons.shield className="h-3 w-3" />
              Webhook
              <Icons.checkCircle2 className="h-3 w-3" />
            </Badge>
          )}
        </div>

        {/* Actions - Collapsible on mobile */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            showActions ? "max-h-44" : "max-h-0 md:max-h-none"
          )}
        >
          <ChannelCardActions
            channel={channel}
            onClickDisconnect={onClickDisconnect}
            onClickReconnect={onClickReconnect}
            onClickDelete={onClickDelete}
            disconnectingChannelId={disconnectingChannelId}
            reconnectingChannelId={reconnectingChannelId}
            deletingChannelId={deletingChannelId}
          />
        </div>

        {/* Mobile expand button */}
        <button
          onClick={() => setShowActions(!showActions)}
          className="mt-4 w-full rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-muted/50 md:hidden dark:text-primary/90 dark:hover:bg-zinc-800/50"
        >
          {showActions ? "Ẩn" : "Hiện thêm"}
        </button>
      </div>
    </div>
  )
}

export default ConnectedChannelCard
