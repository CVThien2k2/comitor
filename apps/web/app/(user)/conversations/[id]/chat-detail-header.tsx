"use client"

import { ConversationItem } from "@/api/conversations"
import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { Icons } from "@/components/global/icons"
import { getConversationDisplayName, getConversationTagLabel, getProviderLabel } from "@/lib/helper"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type ChatDetailHeaderProps = {
  conversation: ConversationItem
  showUserInfo: boolean
  onBack: () => void
  onToggleUserInfo: () => void
}

export function ChatDetailHeader({
  conversation,
  showUserInfo,
  onBack,
  onToggleUserInfo,
}: ChatDetailHeaderProps) {
  const displayName = getConversationDisplayName(conversation)
  const providerLabel = conversation.linkedAccount?.provider
    ? getProviderLabel(conversation.linkedAccount.provider)
    : null
  const conversationTagLabel = conversation.tag === "business" ? getConversationTagLabel(conversation.tag) : null
  const actionButtonClass =
    "size-9 rounded-md border border-border/70 bg-background/70 text-foreground shadow-sm hover:bg-primary/10 hover:text-primary"

  return (
    <div className="border-b border-border bg-muted/40 px-2 py-2 backdrop-blur-sm sm:px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onBack}>
          <Icons.chevronLeft className="h-5 w-5" />
        </Button>
        <ConversationAvatar
          id={conversation.id}
          name={displayName}
          provider={conversation.linkedAccount?.provider}
          avatarUrl={conversation.avatarUrl || undefined}
          className="size-9 md:size-10"
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="truncate text-sm font-semibold text-foreground md:text-base">{displayName}</h3>
          {(providerLabel || conversationTagLabel) && (
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {providerLabel && (
                <Badge className="h-5 max-w-full px-1.5 text-[10px] font-normal">{providerLabel}</Badge>
              )}
              {conversationTagLabel && (
                <Badge className="h-5 max-w-full px-1.5 text-[10px] font-normal">{conversationTagLabel}</Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(actionButtonClass, showUserInfo && "border-primary/40 bg-primary/10 text-primary")}
            onClick={onToggleUserInfo}
            aria-pressed={showUserInfo}
            aria-label="Mở thông tin hội thoại"
          >
            <Icons.moreHorizontal className="size-4 md:size-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  )
}
