'use client'

import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { cn } from '@workspace/ui/lib/utils'

interface MessageBubbleProps {
  content: string
  timestamp: string
  isOwn?: boolean
  senderName?: string
}

export function MessageBubble({
  content,
  timestamp,
  isOwn = false,
  senderName = 'M',
}: MessageBubbleProps) {
  return (
    <div className={cn('flex gap-3 items-end', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-500 text-white text-xs font-bold">
            {senderName[0]}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        'max-w-[70%] space-y-2',
        isOwn && 'text-right'
      )}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl shadow-sm',
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-slate-100 dark:bg-muted text-foreground rounded-bl-none'
          )}
        >
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <span className="text-[10px] text-muted-foreground px-2">{timestamp}</span>
      </div>
    </div>
  )
}
