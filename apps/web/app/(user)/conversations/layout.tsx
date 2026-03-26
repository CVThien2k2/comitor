"use client"

import { ConversationListPanel } from "@/app/(user)/conversations/_components/conversation-list"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import React from "react"
type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="hidden w-full md:flex">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="conversation-list" defaultSize="320px" minSize="200px" maxSize="480px">
            <div className="h-full border-r border-border">
              <ConversationListPanel />
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-border" />
          <ResizablePanel id="conversation-detail" minSize={50} className="min-w-0">
            <div className="min-w-0 h-full">{children}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="flex w-full flex-col md:hidden">{children}</div>
    </div>
  )
}

export default Layout
