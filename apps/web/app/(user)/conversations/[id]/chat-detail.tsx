"use client"

import { conversations as conversationsApi } from "@/api/conversations"
import { useChatStore } from "@/stores/chat-store"
import { useQuery } from "@tanstack/react-query"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"
import { useResizablePanel } from "@workspace/ui/hooks/use-resizable-panel"
import { cn } from "@workspace/ui/lib/utils"
import { useCallback, useEffect } from "react"
import { UserInfoPanel } from "../_components/user-info-panel"
import { ChatDetailMessages } from "./chat-detail-messages"
import { ChatDetailNotFound } from "./chat-detail-not-found"
import { ChatDetailSkeleton } from "./chat-detail-skeleton"

export function ChatDetail({ id }: { id: string }) {
  const { selectedConversation, setSelectedConversation } = useChatStore()
  const showUserInfo = useChatStore((s) => s.showUserInfoPanel)
  const setShowUserInfo = useChatStore((s) => s.setShowUserInfoPanel)
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  const {
    width: infoWidth,
    isResizing,
    handleMouseDown: onResizeStart,
  } = useResizablePanel({
    storageKey: "conversation-info-width",
    minWidth: 200,
    defaultWidth: 300,
    maxWidth: 500,
    reverse: true,
  })

  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["conversations", "detail", id],
    queryFn: () => conversationsApi.getById(id),
    enabled: !!id && !selectedConversation,
  })

  useEffect(() => {
    if (!selectedConversation && conversation?.data && !isLoadingConversation) {
      setSelectedConversation(conversation.data)
    }
  }, [selectedConversation, conversation?.data, setSelectedConversation, isLoadingConversation])

  const handleCloseUserInfo = useCallback(() => setShowUserInfo(false), [setShowUserInfo])

  if (isLoadingConversation) return <ChatDetailSkeleton />
  if (!selectedConversation) return <ChatDetailNotFound />

  if (!isDesktop) {
    return (
      <>
        <ChatDetailMessages />
        <Sheet open={showUserInfo} onOpenChange={setShowUserInfo}>
          <SheetContent side="right" showCloseButton={false} className="w-80 p-0 sm:max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Thông tin người dùng</SheetTitle>
            </SheetHeader>
            <UserInfoPanel conversation={selectedConversation} onClose={handleCloseUserInfo} />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1">
        <ChatDetailMessages />
      </div>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border-l border-border bg-background transition-[width] duration-300 ease-in-out",
          showUserInfo ? "" : "w-0 border-l-0",
          isResizing && "transition-none"
        )}
        style={showUserInfo ? { width: infoWidth } : undefined}
      >
        <div
          onMouseDown={onResizeStart}
          className={cn(
            "absolute top-0 left-0 z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/30",
            isResizing && "bg-primary/40"
          )}
        />
        <div className="h-full" style={{ width: infoWidth }}>
          <UserInfoPanel conversation={selectedConversation} onClose={handleCloseUserInfo} />
        </div>
      </div>
    </div>
  )
}
