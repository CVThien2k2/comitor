'use client'

import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Zap, CheckCircle, MoreVertical, PanelLeft, PanelLeftClose } from 'lucide-react'
import { useChatLayout } from './chat-layout'

interface ChatHeaderProps {
  contactName: string
  status: string
  platform: string
}

export function ChatHeader({
  contactName,
  status,
  platform,
}: ChatHeaderProps) {
  const { toggleContextPanel, toggleConversationList, showConversationList } = useChatLayout()

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6 gap-2">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleConversationList}
          aria-label={showConversationList ? 'Thu gọn danh sách hội thoại' : 'Mở danh sách hội thoại'}
        >
          {showConversationList ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </Button>
        <Avatar>
          <AvatarFallback className="bg-indigo-600 text-white">
            {contactName.split(' ')[0]?.charAt(0) || ''}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{contactName}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-4 text-[10px]">
              {status}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {platform}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-medium gap-1"
        >
          <Zap className="w-3 h-3" />
          Giao việc
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-medium gap-1"
        >
          <CheckCircle className="w-3 h-3" />
          Giải quyết
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleContextPanel}
          aria-label="Mở/đóng bảng ngữ cảnh"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
