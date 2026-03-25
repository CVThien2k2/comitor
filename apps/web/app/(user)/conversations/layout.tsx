"use client"

import { ConversationListPanel } from "@/app/(user)/conversations/_components/conversation-list"
import { useResizablePanel } from "@workspace/ui/hooks/use-resizable-panel"
import { cn } from "@workspace/ui/lib/utils"
import React from "react"
type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const {
    width: listWidth,
    isResizing,
    handleMouseDown: onResizeStart,
  } = useResizablePanel({
    storageKey: "conversation-list-width",
    minWidth: 200,
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
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      <div className="flex w-full flex-col md:hidden">{children}</div>
    </div>
  )
}

export default Layout
