"use client"

import { useResizablePanel } from "@workspace/ui/hooks/use-resizable-panel"
import { cn } from "@workspace/ui/lib/utils"
import { useChatStore } from "@/stores/chat-store"
import { ChatPanel } from "./chat-panel"
import { ConversationListPanel } from "./conversation-list"
import { EmptyState } from "./empty-state"

export function ConversationsPage() {
  const selectedConversation = useChatStore((s) => s.selectedConversation)

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

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="hidden w-full md:flex">
        <div className="relative shrink-0 border-r border-border" style={{ width: listWidth }}>
          <ConversationListPanel />
          <div
            onMouseDown={onResizeStart}
            className={cn(
              "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/30",
              isResizing && "bg-primary/40"
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          {selectedConversation ? <ChatPanel /> : <EmptyState />}
        </div>
      </div>

      <div className="flex w-full flex-col md:hidden">
        {selectedConversation ? <ChatPanel /> : <ConversationListPanel />}
      </div>
    </div>
  )
}
