"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"

// Types
export interface Message {
  id: string
  content: string
  timestamp: string
  isCustomer: boolean
  senderName?: string
  senderAvatar?: string
  avatarColor?: string
}

export interface AISuggestion {
  id: string
  content: string
  type: "reply" | "action"
}

interface ChatWindowProps {
  customerName: string
  customerOrg?: string
  avatarColor: string
  channel: "zalo" | "facebook" | "website"
  status: "online" | "offline" | "away"
  messages: Message[]
  aiSuggestions?: AISuggestion[]
  onSendMessage: (message: string) => void
  onUseSuggestion?: (suggestion: AISuggestion) => void
  onToggleCustomerPanel?: () => void
  compactMode?: boolean
  compact?: boolean
}

// Helper to group messages by date
function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ""

  messages.forEach((message) => {
    // Extract date from timestamp (e.g., "10:30" -> today, "Hôm qua" -> yesterday)
    const messageDate = message.timestamp.includes(":") ? "Hôm nay" : message.timestamp
    
    if (messageDate !== currentDate) {
      currentDate = messageDate
      groups.push({ date: messageDate, messages: [message] })
    } else {
      groups[groups.length - 1]?.messages.push(message)
    }
  })

  return groups
}

function MessageBubble({ message, showAvatar = true }: { message: Message; showAvatar?: boolean }) {
  const initials = message.senderName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  return (
    <div className={cn(
      "flex gap-2.5 max-w-[85%]",
      message.isCustomer ? "self-start" : "self-end flex-row-reverse"
    )}>
      {/* Avatar */}
      {showAvatar && message.isCustomer && (
        <Avatar className="size-8 shrink-0 mt-1">
          <AvatarFallback 
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: message.avatarColor || "#6366f1" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && message.isCustomer && <div className="size-8 shrink-0" />}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-1",
        message.isCustomer ? "items-start" : "items-end"
      )}>
        {message.isCustomer && showAvatar && message.senderName && (
          <span className="text-xs text-muted-foreground ml-1">
            {message.senderName}
          </span>
        )}
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          message.isCustomer
            ? "bg-muted text-foreground rounded-tl-md"
            : "bg-primary text-primary-foreground rounded-tr-md"
        )}>
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  )
}

function AISuggestionCard({ 
  suggestions, 
  onUse, 
  onDismiss 
}: { 
  suggestions: AISuggestion[]
  onUse: (suggestion: AISuggestion) => void
  onDismiss: () => void 
}) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (suggestion: AISuggestion) => {
    navigator.clipboard.writeText(suggestion.content)
    setCopiedId(suggestion.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mx-4 mb-4 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icons.sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Gợi ý từ AI</h4>
            <p className="text-[11px] text-muted-foreground">Dựa trên ngữ cảnh hội thoại</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          className="size-6 text-muted-foreground hover:text-foreground"
        >
          <Icons.x className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted transition-all duration-200"
          >
            <Icons.bot className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="flex-1 text-sm text-foreground/90 leading-relaxed">
              {suggestion.content}
            </p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(suggestion)}
                className="size-7"
              >
                {copiedId === suggestion.id ? (
                  <Icons.check className="size-3.5 text-emerald-500" />
                ) : (
                  <Icons.copy className="size-3.5" />
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onUse(suggestion)}
                className="h-7 text-xs px-2.5"
              >
                Sử dụng
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium px-2">
        {date}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export function ChatWindow({
  customerName,
  customerOrg,
  avatarColor,
  channel,
  status,
  messages,
  aiSuggestions = [],
  onSendMessage,
  onUseSuggestion,
  onToggleCustomerPanel,
  compactMode, // eslint-disable-line @typescript-eslint/no-unused-vars
  compact, // eslint-disable-line @typescript-eslint/no-unused-vars
}: ChatWindowProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(aiSuggestions.length > 0)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const initials = customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const messageGroups = groupMessagesByDate(messages)

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleUseSuggestion = (suggestion: AISuggestion) => {
    setInputValue(suggestion.content)
    onUseSuggestion?.(suggestion)
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  React.useEffect(() => {
    setShowSuggestions(aiSuggestions.length > 0)
  }, [aiSuggestions])

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    away: "bg-amber-500",
  }

  const statusLabels = {
    online: "Đang hoạt động",
    offline: "Ngoại tuyến",
    away: "Vắng mặt",
  }

  const channelLabels = {
    zalo: "Zalo",
    facebook: "Facebook",
    website: "Website",
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-10">
              <AvatarFallback
                className="text-sm font-semibold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background",
              statusColors[status]
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{customerName}</h3>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                {channelLabels[channel]}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn(
                "size-1.5 rounded-full",
                statusColors[status]
              )} />
              <span>{statusLabels[status]}</span>
              {customerOrg && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{customerOrg}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Icons.phone className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Icons.video className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" onClick={onToggleCustomerPanel}>
            <Icons.panelRight className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Icons.moreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-background">
        <div className="flex flex-col gap-1">
          {messageGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <DateSeparator date={group.date} />
              {group.messages.map((message, msgIndex) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={
                    msgIndex === 0 ||
                    group.messages[msgIndex - 1]?.isCustomer !== message.isCustomer
                  }
                />
              ))}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <AISuggestionCard
          suggestions={aiSuggestions}
          onUse={handleUseSuggestion}
          onDismiss={() => setShowSuggestions(false)}
        />
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-background border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={2}
            className="w-full bg-transparent resize-none text-sm placeholder:text-muted-foreground text-foreground focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                <Icons.paperclip className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                <Icons.smile className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 h-8"
                onClick={() => setShowSuggestions(true)}
              >
                <Icons.sparkles className="size-3.5" />
                <span className="text-xs">AI gợi ý</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 gap-1"
              >
                <span className="text-xs">Gửi sau</span>
                <Icons.chevronDown className="size-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-8 px-4 gap-1.5"
              >
                <Icons.send className="size-3.5" />
                <span className="text-xs">Gửi</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
