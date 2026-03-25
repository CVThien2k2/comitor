import { useMemo } from "react"
import type { Conversation } from "@/api/conversations"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { formatTimestamp, getConversationDisplayName } from "@/lib/helper"
import { useChatStore } from "@/stores/chat-store"
import { useConversations } from "@/hooks/use-conversations"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import { useAuthStore } from "@/stores/auth-store"

export function ConversationItem({ conversation }: { conversation: Conversation }) {
  const router = useRouter()
  const isSelected = useChatStore((s) => s.selectedConversation?.id === conversation.id)
  const setSelectedConversation = useChatStore((s) => s.setSelectedConversation)
  const { markAsRead } = useConversations()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const handleClick = () => {
    setSelectedConversation(conversation)
    if (conversation.unreadCount) {
      markAsRead(conversation.id)
    }
    router.push(ROUTES.conversationDetail.path.replace(":id", conversation.id))
  }
  const displayName = getConversationDisplayName(conversation)
  const lastMsg = conversation.messages?.[0]
  const unreadCount = conversation.unreadCount ?? 0
  const isUnread = unreadCount > 0

  const isRecentlyActive = useMemo(() => {
    if (!lastMsg) return false
    const now = new Date()
    return now.getTime() - new Date(lastMsg.createdAt).getTime() < 3600000
  }, [lastMsg])

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-all duration-200",
        "hover:bg-accent/50",
        isSelected && "border-l-2 border-l-primary bg-accent/70",
        isUnread && !isSelected && "bg-primary/3"
      )}
    >
      <div className="relative shrink-0">
        <ConversationAvatar id={conversation.id} name={displayName} provider={conversation.linkedAccount?.provider} />
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
            {lastMsg.senderType === "agent" &&
              ((lastMsg.userId ?? lastMsg.user?.id) && (lastMsg.userId ?? lastMsg.user?.id) === currentUserId
                ? "Bạn: "
                : `${lastMsg.user?.name ?? "Agent"}: `)}
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
