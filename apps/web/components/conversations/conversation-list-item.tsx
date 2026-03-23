import { useMemo } from "react"
import type { ConversationItem } from "@/api/conversations"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import {
  formatTimestamp,
  getAvatarColor,
  getConversationDisplayName,
  getInitials,
} from "@/lib/helper"
import { ChannelBadge } from "./channel-badge"

export function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: ConversationItem
  isSelected: boolean
  onClick: () => void
}) {
  const displayName = getConversationDisplayName(conversation)
  const initials = getInitials(displayName)
  const lastMsg = conversation.lastMessage
  const unreadCount = conversation.unreadCount
  const isUnread = unreadCount > 0
  const avatarColor = getAvatarColor(conversation.id)
  const isRecentlyActive = useMemo(() => {
    if (!lastMsg) return false
    const now = new Date()
    return now.getTime() - new Date(lastMsg.createdAt).getTime() < 3600000
  }, [lastMsg])

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-all duration-200",
        "hover:bg-accent/50",
        isSelected && "border-l-2 border-l-primary bg-accent/70",
        isUnread && !isSelected && "bg-primary/3"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: avatarColor }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <ChannelBadge provider={conversation.linkedAccount.provider} />
        {isRecentlyActive && (
          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm font-medium", isUnread ? "text-foreground" : "text-foreground/80")}>
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-[11px] whitespace-nowrap text-muted-foreground">
              {formatTimestamp(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {conversation.tag === "business" && (
            <Badge variant="outline" className="h-4 shrink-0 border-blue-200 px-1 text-[9px] font-normal text-blue-600">
              B2B
            </Badge>
          )}
        </div>

        {lastMsg && (
          <p className={cn("truncate text-sm", isUnread ? "font-medium text-foreground/90" : "text-muted-foreground")}>
            {lastMsg.senderType === "agent" && "Bạn: "}
            {lastMsg.content || "[Tệp đính kèm]"}
          </p>
        )}
      </div>

      {isUnread && (
        <Badge className="mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-semibold text-primary-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </button>
  )
}
