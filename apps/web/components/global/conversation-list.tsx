"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Search } from "lucide-react"

interface Conversation {
  id: string
  name: string
  platform: string
  lastMessage: string
  time: string
  active?: boolean
  priority?: "high" | "normal"
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Mai Nguyễn",
    platform: "Vietnam Airlines • Messenger",
    lastMessage: "Cần hỗ trợ đặt chỗ nhóm 30 người cho tuần tới...",
    time: "10:15 SA",
    active: true,
    priority: "high",
  },
  {
    id: "2",
    name: "Hùng Phạm",
    platform: "Vietnam Airlines • Zalo",
    lastMessage: "Hỏi về điều khoản hợp đồng mới...",
    time: "Hôm qua",
    active: false,
    priority: "normal",
  },
]

export function ConversationList() {
  return (
    <aside className="flex h-full w-80 min-w-80 flex-col border-r bg-background">
      {/* Header */}
      <div className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b px-4 py-3">
        <h2 className="min-w-0 truncate text-lg font-semibold">Hội thoại</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Search className="h-4 w-4" />
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
            variant={conv.active ? "default" : "ghost"}
            className={cn(
              "h-auto w-full flex-col items-start justify-start rounded-none border-b p-4 text-left",
              conv.active
                ? "bg-indigo-500/15 text-foreground dark:bg-indigo-500/20 dark:text-indigo-100"
                : "bg-transparent text-foreground"
            )}
          >
            <div className="mb-1 flex w-full justify-between">
              <span className="text-sm font-semibold">{conv.name}</span>
              <span
                className={cn(
                  "text-xs",
                  conv.active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                )}
              >
                {conv.time}
              </span>
            </div>
            <div
              className={cn(
                "mb-2 text-xs",
                conv.active ? "text-indigo-700 dark:text-indigo-300" : "text-muted-foreground"
              )}
            >
              {conv.platform}
            </div>
            <p
              className={cn(
                "w-full truncate text-sm",
                conv.active ? "text-foreground dark:text-indigo-100" : "text-muted-foreground"
              )}
            >
              {conv.lastMessage}
            </p>
            {conv.priority === "high" && (
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
