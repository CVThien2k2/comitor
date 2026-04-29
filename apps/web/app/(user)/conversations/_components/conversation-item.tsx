import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { formatTimestamp, getConversationDisplayName } from "@/lib/helper"
import type { ConversationItem, MessageItem } from "@/lib/types"
import { useAuthStore } from "@/stores/auth-store"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

const ATTACHMENT_FALLBACK_TEXT = "[Tệp đính kèm]"

function getMessageTextContent(content: unknown): string {
  if (!content) return ""
  if (typeof content === "string") return content.trim()

  if (Array.isArray(content)) {
    const textParts = content
      .map((part) => {
        if (!part || typeof part !== "object") return ""
        const maybeText = (part as { text?: unknown }).text
        return typeof maybeText === "string" ? maybeText.trim() : ""
      })
      .filter(Boolean)
    return textParts.join(" ").trim()
  }

  if (typeof content === "object") {
    const maybeText = (content as { text?: unknown }).text
    return typeof maybeText === "string" ? maybeText.trim() : ""
  }

  return ""
}

function getConversationPreview(lastMsg: MessageItem | undefined) {
  if (!lastMsg) return ""
  return getMessageTextContent(lastMsg.content) || ATTACHMENT_FALLBACK_TEXT
}

function getSenderPrefix(lastMsg: MessageItem, currentUserId?: string) {
  if (lastMsg.senderType === "agent") {
    const senderId = lastMsg.createdBy ?? lastMsg.createdByUser?.id
    return senderId && senderId === currentUserId ? "Bạn: " : `${lastMsg.createdByUser?.name ?? "Agent"}: `
  }

  if (lastMsg.senderType === "customer") {
    return `${lastMsg.accountCustomer?.name ?? "Khách hàng"}: `
  }

  return ""
}

export function ConversationItem({
  conversation,
  onClick,
}: {
  conversation: ConversationItem
  onClick: (conversation: ConversationItem) => void
}) {
  const pathname = usePathname()
  const isSelected = pathname === `/conversations/${conversation.id}`
  const currentUserId = useAuthStore((s) => s.user?.id)

  const unreadCount = conversation.countUnreadMessages ?? 0
  const isUnread = conversation.isUnread

  const displayName = getConversationDisplayName(conversation)
  const lastMsg = conversation.messages?.[0]
  const previewText = useMemo(() => getConversationPreview(lastMsg), [lastMsg])

  const isRecentlyActive = useMemo(() => {
    if (!lastMsg) return false
    const now = new Date()
    return now.getTime() - new Date(lastMsg.createdAt).getTime() < 3600000
  }, [lastMsg])

  return (
    <button
      onClick={() => onClick(conversation)}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-all duration-200",
        "hover:bg-accent/50",
        isSelected && "border-l-4 border-l-primary bg-primary/12 shadow-xs",
        isUnread && !isSelected && "bg-primary/3"
      )}
    >
      <div className="relative shrink-0">
        <ConversationAvatar
          id={conversation.id}
          name={displayName}
          provider={conversation.linkedAccount?.provider}
          avatarUrl={conversation.avatarUrl || undefined}
        />
        {isRecentlyActive && (
          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn("truncate text-sm font-medium", isUnread ? "text-foreground" : "text-foreground/80")}>
            {displayName}
          </span>
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
            {getSenderPrefix(lastMsg, currentUserId)}
            {previewText}
          </p>
        )}
      </div>

      {(isUnread || !!lastMsg) && (
        <div className="flex shrink-0 flex-col items-end justify-between gap-1 self-stretch">
          {isUnread ? (
            <Badge className="flex size-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : (
            <span />
          )}
          {lastMsg && (
            <span className="mt-auto text-[11px] whitespace-nowrap text-muted-foreground">
              {formatTimestamp(lastMsg.createdAt)}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
