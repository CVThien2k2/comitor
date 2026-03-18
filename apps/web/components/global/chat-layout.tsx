"use client"

import { useState, useCallback, createContext, useContext } from "react"
import { ChatWindow } from "./chat-window"
import { ContextPanel } from "./context-panel"
import { ConversationList } from "./conversation-list"
import { cn } from "@workspace/ui/lib/utils"

interface ChatLayoutContextValue {
  showConversationList: boolean
  showContextPanel: boolean
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
  const [showConversationList, setShowConversationList] = useState(true)
  const [showContextPanel, setShowContextPanel] = useState(true)

  const toggleConversationList = useCallback(() => setShowConversationList((v) => !v), [])
  const toggleContextPanel = useCallback(() => setShowContextPanel((v) => !v), [])

  const value: ChatLayoutContextValue = {
    showConversationList,
    showContextPanel,
    toggleConversationList,
    toggleContextPanel,
  }

  return (
    <ChatLayoutContext.Provider value={value}>
      <div className="flex h-full overflow-hidden">
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
            showConversationList ? "w-80" : "w-0 min-w-0"
          )}
        >
          <ConversationList />
        </div>

        <ChatWindow />

        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
            showContextPanel ? "w-80" : "w-0 min-w-0"
          )}
        >
          <ContextPanel />
        </div>
      </div>
    </ChatLayoutContext.Provider>
  )
}
