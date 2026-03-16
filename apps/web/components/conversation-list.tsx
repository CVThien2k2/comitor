'use client'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { Search } from 'lucide-react'

interface Conversation {
  id: string
  name: string
  platform: string
  lastMessage: string
  time: string
  active?: boolean
  priority?: 'high' | 'normal'
}

const conversations: Conversation[] = [
  {
    id: '1',
    name: 'Mai Nguyễn',
    platform: 'Vietnam Airlines • Messenger',
    lastMessage: 'Cần hỗ trợ đặt chỗ nhóm 30 người cho tuần tới...',
    time: '10:15 SA',
    active: true,
    priority: 'high',
  },
  {
    id: '2',
    name: 'Hùng Phạm',
    platform: 'Vietnam Airlines • Zalo',
    lastMessage: 'Hỏi về điều khoản hợp đồng mới...',
    time: 'Hôm qua',
    active: false,
    priority: 'normal',
  },
]

export function ConversationList() {
  return (
    <aside className="w-80 min-w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b grid grid-cols-[1fr_auto] items-center gap-3 flex-shrink-0">
        <h2 className="font-semibold text-lg truncate min-w-0">Hội thoại</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <Input placeholder="Tìm kiếm..." className="h-8" />
      </div>

      {/* Conversation Items */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <Button
            key={conv.id}
            variant={conv.active ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start p-4 h-auto rounded-none border-b text-left flex-col items-start',
              conv.active
                ? 'bg-indigo-500/15 dark:bg-indigo-500/20 text-foreground dark:text-indigo-100'
                : 'bg-transparent text-foreground'
            )}
          >
            <div className="w-full flex justify-between mb-1">
              <span className="font-semibold text-sm">{conv.name}</span>
              <span
                className={cn(
                  'text-xs',
                  conv.active ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
                )}
              >
                {conv.time}
              </span>
            </div>
            <div
              className={cn(
                'text-xs mb-2',
                conv.active ? 'text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground'
              )}
            >
              {conv.platform}
            </div>
            <p
              className={cn(
                'text-sm truncate w-full',
                conv.active ? 'text-foreground dark:text-indigo-100' : 'text-muted-foreground'
              )}
            >
              {conv.lastMessage}
            </p>
            {conv.priority === 'high' && (
              <Badge variant="destructive" className="mt-2 text-[10px]">
                Ưu tiên cao
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </aside>
  )
}
