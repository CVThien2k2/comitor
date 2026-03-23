"use client"

import { useResizablePanel } from "@workspace/ui/hooks/use-resizable-panel"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import { ChatPanel } from "./chat-panel"
import { ConversationListPanel } from "./conversation-list"
import { EmptyState } from "./empty-state"
import type { ConversationItem } from "@/api/conversations"

export function ConversationsPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = React.useState<ConversationItem | null>(null)

  const {
    width: listWidth,
    isResizing,
    handleMouseDown: onResizeStart,
  } = useResizablePanel({
    storageKey: "conversation-list-width",
    minWidth: 320,
    defaultWidth: 320,
    maxWidth: 480,
  })

  const handleSelectConversation = (conversation: ConversationItem) => {
    setSelectedId(conversation.id)
    setSelectedConversation(conversation)
  }

  const handleBackToList = () => {
    setSelectedId(null)
    setSelectedConversation(null)
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="hidden w-full md:flex">
        <div className="relative shrink-0 border-r border-border" style={{ width: listWidth }}>
          <ConversationListPanel selectedId={selectedId} onSelect={handleSelectConversation} />
          <div
            onMouseDown={onResizeStart}
            className={cn(
              "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/30",
              isResizing && "bg-primary/40"
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          {selectedConversation ? <ChatPanel conversation={selectedConversation} /> : <EmptyState />}
        </div>
      </div>

      {/* Mobile (<768px) - View switching */}
      <div className="flex w-full flex-col md:hidden">
        {selectedConversation ? (
          <ChatPanel conversation={selectedConversation} onBack={handleBackToList} />
        ) : (
          <ConversationListPanel selectedId={selectedId} onSelect={handleSelectConversation} />
        )}
      </div>
    </div>
  )
}
