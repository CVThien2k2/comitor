"use client"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Zap, CheckCircle, MoreVertical, PanelLeft, PanelLeftClose } from "lucide-react"
import { useChatLayout } from "./chat-layout"

interface ChatHeaderProps {
  contactName: string
  status: string
  platform: string
}

export function ChatHeader({ contactName, status, platform }: ChatHeaderProps) {
  const { toggleContextPanel, toggleConversationList, showConversationList } = useChatLayout()

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleConversationList}
          aria-label={showConversationList ? "Thu gọn danh sách hội thoại" : "Mở danh sách hội thoại"}
        >
          {showConversationList ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
        <Avatar>
          <AvatarFallback className="bg-indigo-600 text-white">
            {contactName.split(" ")[0]?.charAt(0) || ""}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{contactName}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-4 text-[10px]">
              {status}
            </Badge>
            <p className="text-xs text-muted-foreground">{platform}</p>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <Button variant="outline" size="sm" className="gap-1 text-xs font-medium">
          <Zap className="h-3 w-3" />
          Giao việc
        </Button>
        <Button variant="outline" size="sm" className="gap-1 text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          Giải quyết
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleContextPanel} aria-label="Mở/đóng bảng ngữ cảnh">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
