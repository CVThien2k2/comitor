"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

// Channel icons as small components
const ZaloIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.785c-.066.037-.273.15-.493.15-.266 0-.463-.135-.59-.405l-1.477-3.13h-5.74l-.003.007-1.46 3.104c-.13.277-.335.424-.612.424-.213 0-.42-.108-.488-.147-.332-.188-.535-.543-.535-.947 0-.16.04-.324.122-.5l4.47-9.297c.174-.36.5-.58.88-.58.382 0 .71.22.884.583l4.47 9.294c.082.176.123.34.123.5 0 .404-.202.76-.551.944zM12 6.82l-2.238 4.643h4.476L12 6.82z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

// Types
export interface Conversation {
  id: string
  customerName: string
  customerOrg?: string
  avatarColor: string
  lastMessage: string
  timestamp: string
  channel: "zalo" | "facebook" | "website"
  isUnread: boolean
  isPriority: boolean
  status: "open" | "pending" | "resolved"
  assignee?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const channelConfig = {
  zalo: { icon: ZaloIcon, color: "text-blue-500", bg: "bg-blue-50" },
  facebook: { icon: FacebookIcon, color: "text-blue-600", bg: "bg-blue-50" },
  website: { icon: WebsiteIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
}

const statusConfig = {
  open: { icon: Icons.messageSquare, color: "text-emerald-600" },
  pending: { icon: Icons.clock, color: "text-amber-500" },
  resolved: { icon: Icons.checkCheck, color: "text-muted-foreground" },
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: Conversation
  isSelected: boolean
  onClick: () => void 
}) {
  const channel = channelConfig[conversation.channel]
  const status = statusConfig[conversation.status] // eslint-disable-line @typescript-eslint/no-unused-vars
  const ChannelIcon = channel.icon
  const initials = conversation.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-all duration-200 border-b border-border",
        "hover:bg-accent/50",
        isSelected && "bg-accent/70 border-l-2 border-l-primary",
        conversation.isUnread && !isSelected && "bg-primary/[0.03]"
      )}
    >
      {/* Avatar with channel indicator */}
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarFallback 
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: conversation.avatarColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 size-5 rounded-full flex items-center justify-center border-2 border-background",
          channel.bg,
          channel.color
        )}>
          <ChannelIcon />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "font-medium text-sm truncate",
              conversation.isUnread ? "text-foreground" : "text-foreground/80"
            )}>
              {conversation.customerName}
            </span>
            {conversation.isPriority && (
              <Icons.alertCircle className="size-3.5 text-amber-500 shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {conversation.timestamp}
          </span>
        </div>
        
        {conversation.customerOrg && (
          <p className="text-[11px] text-muted-foreground truncate">
            {conversation.customerOrg}
          </p>
        )}
        
        <p className={cn(
          "text-sm truncate",
          conversation.isUnread ? "text-foreground/90 font-medium" : "text-muted-foreground"
        )}>
          {conversation.lastMessage}
        </p>
      </div>

      {/* Unread indicator */}
      {conversation.isUnread && (
        <span className="size-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </button>
  )
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")

  const filteredConversations = React.useMemo(() => {
    let filtered = conversations

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.customerName.toLowerCase().includes(query) ||
          c.lastMessage.toLowerCase().includes(query) ||
          c.customerOrg?.toLowerCase().includes(query)
      )
    }

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter((c) => c.isUnread)
    } else if (activeTab === "priority") {
      filtered = filtered.filter((c) => c.isPriority)
    } else if (activeTab === "mine") {
      filtered = filtered.filter((c) => c.assignee === "me")
    }

    return filtered
  }, [conversations, searchQuery, activeTab])

  const unreadCount = conversations.filter((c) => c.isUnread).length
  const priorityCount = conversations.filter((c) => c.isPriority).length

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Hội thoại</h2>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <Icons.filter className="size-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hội thoại..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-border"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-8 p-0.5 bg-muted/70">
            <TabsTrigger value="all" className="flex-1 h-7 text-xs">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 h-7 text-xs gap-1">
              Chưa đọc
              {unreadCount > 0 && (
                <Badge variant="secondary" className="size-5 p-0 text-[10px] bg-primary text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex-1 h-7 text-xs gap-1">
              Ưu tiên
              {priorityCount > 0 && (
                <Badge variant="secondary" className="size-5 p-0 text-[10px] bg-amber-500 text-white">
                  {priorityCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 h-7 text-xs">
              Của tôi
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Icons.messageSquare className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Không có hội thoại nào</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
