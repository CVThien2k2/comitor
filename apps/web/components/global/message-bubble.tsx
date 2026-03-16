"use client"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

interface MessageBubbleProps {
  content: string
  timestamp: string
  isOwn?: boolean
  senderName?: string
}

export function MessageBubble({ content, timestamp, isOwn = false, senderName = "M" }: MessageBubbleProps) {
  return (
    <div className={cn("flex items-end gap-3", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-blue-500 text-xs font-bold text-white">{senderName[0]}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[70%] space-y-2", isOwn && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isOwn
              ? "rounded-br-none bg-indigo-600 text-white"
              : "rounded-bl-none bg-slate-100 text-foreground dark:bg-muted"
          )}
        >
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <span className="px-2 text-[10px] text-muted-foreground">{timestamp}</span>
      </div>
    </div>
  )
}
