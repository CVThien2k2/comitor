"use client"

import { useState, useCallback, createContext, useContext } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { ContextPanel } from "./context-panel"
import { ConversationList } from "./conversation-list"
import { cn } from "@workspace/ui/lib/utils"

interface ChatLayoutContextValue {
  showChatSidebar: boolean
  showConversationList: boolean
  showContextPanel: boolean
  toggleChatSidebar: () => void
  toggleConversationList: () => void
  toggleContextPanel: () => void
}

const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(null)

export function useChatLayout() {
  const ctx = useContext(ChatLayoutContext)
  if (!ctx) throw new Error("useChatLayout must be used within ChatLayout")
  return ctx
}

export function ChatLayout() {
  const [showChatSidebar, setShowChatSidebar] = useState(true)
  const [showConversationList, setShowConversationList] = useState(true)
  const [showContextPanel, setShowContextPanel] = useState(true)

  const toggleChatSidebar = useCallback(() => {
    setShowChatSidebar((v) => !v)
  }, [])
  const toggleConversationList = useCallback(() => {
    setShowConversationList((v) => !v)
  }, [])
  const toggleContextPanel = useCallback(() => {
    setShowContextPanel((v) => !v)
  }, [])

  const value: ChatLayoutContextValue = {
    showChatSidebar,
    showConversationList,
    showContextPanel,
    toggleChatSidebar,
    toggleConversationList,
    toggleContextPanel,
  }

  return (
    <ChatLayoutContext.Provider value={value}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* ChatSidebar - collapsed = icon bar w-12, expanded = full w-64 */}
        <div
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r bg-background transition-[width] duration-300 ease-in-out",
            "max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:z-40 max-md:shadow-xl",
            "max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
            showChatSidebar ? "w-64 max-md:w-64 max-md:translate-x-0" : "w-12 min-w-12 max-md:w-12 max-md:translate-x-0"
          )}
        >
          <ChatSidebar onToggle={toggleChatSidebar} isOpen={showChatSidebar} />
        </div>

        {/* ConversationList - collapsible, khi đóng ẩn hẳn, mở/đóng từ ChatHeader */}
        <div
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r bg-background transition-[width] duration-300 ease-in-out",
            "max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:z-40 max-md:shadow-xl",
            "max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
            showConversationList
              ? "w-80 max-md:w-72 max-md:translate-x-0"
              : "w-0 min-w-0 border-r-0 max-md:translate-x-0"
          )}
        >
          <ConversationList />
        </div>

        <ChatWindow />

        {/* ContextPanel - collapsible, khi đóng ẩn hẳn, mở/đóng từ ChatHeader (MoreVertical) */}
        <div
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-l bg-background transition-[width] duration-300 ease-in-out",
            "max-md:fixed max-md:top-0 max-md:right-0 max-md:bottom-0 max-md:z-40 max-md:shadow-xl",
            "max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
            showContextPanel ? "w-80 max-md:w-72 max-md:translate-x-0" : "w-0 min-w-0 border-l-0 max-md:translate-x-0"
          )}
        >
          <ContextPanel />
        </div>

        {/* Mobile backdrop when any sidebar open */}
        {(showChatSidebar || showConversationList || showContextPanel) && (
          <div
            className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden"
            onClick={() => {
              if (showChatSidebar) toggleChatSidebar()
              if (showConversationList) toggleConversationList()
              if (showContextPanel) toggleContextPanel()
            }}
            aria-hidden
          />
        )}
      </div>
    </ChatLayoutContext.Provider>
  )
}
