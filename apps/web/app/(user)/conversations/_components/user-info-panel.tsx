"use client"

import { ConversationAvatar } from "@/components/global/conversation-avatar"
import { Icons } from "@/components/global/icons"
import { getConversationDisplayName, getProviderLabel } from "@/lib/helper"
import type { Conversation } from "@workspace/shared"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

type UserInfoPanelProps = {
  conversation: Conversation
  onClose: () => void
}

export function UserInfoPanel({ conversation, onClose }: UserInfoPanelProps) {
  const displayName = getConversationDisplayName(conversation)
  const provider = conversation.linkedAccount?.provider

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Thông tin</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <Icons.x className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-4">
        <ConversationAvatar
          id={conversation.id}
          name={displayName}
          provider={provider}
          className="size-16"
        />
        <p className="text-sm font-semibold text-foreground">{displayName}</p>
        {provider && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            {getProviderLabel(provider)}
          </Badge>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-3 px-4 py-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chi tiết</h4>

        <div className="flex items-center gap-3 text-sm">
          <Icons.messageSquare className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Loại:</span>
          <span className="font-medium text-foreground">{conversation.type === "group" ? "Nhóm" : "Cá nhân"}</span>
        </div>

        {conversation.tag === "business" && (
          <div className="flex items-center gap-3 text-sm">
            <Icons.tag className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Phân loại:</span>
            <span className="font-medium text-foreground">Kinh doanh</span>
          </div>
        )}

        {conversation.lastActivityAt && (
          <div className="flex items-center gap-3 text-sm">
            <Icons.clock className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Hoạt động:</span>
            <span className="font-medium text-foreground">
              {new Date(conversation.lastActivityAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

        {conversation.accountCustomer?.goldenProfile?.fullName && (
          <div className="flex items-center gap-3 text-sm">
            <Icons.user className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Khách hàng:</span>
            <span className="font-medium text-foreground">
              {conversation.accountCustomer.goldenProfile.fullName}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
