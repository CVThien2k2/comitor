"use client"

import { conversations as conversationsApi } from "@/api/conversations"
import { useConversations } from "@/hooks/use-conversations"
import { useChatStore } from "@/stores/chat-store"
import { useQuery } from "@tanstack/react-query"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { UserInfoPanel } from "../_components/user-info-panel"
import { ChatDetailMessages } from "./chat-detail-messages"
import { ChatDetailNotFound } from "./chat-detail-not-found"
import { ChatDetailSkeleton } from "./chat-detail-skeleton"

export function ChatDetail({ id }: { id: string }) {
  const conversationFromStore = useChatStore(
    (s) => s.conversations.find((conversation) => conversation.id === id) ?? null
  )
  const { markAsRead } = useConversations()

  const [showUserInfo, setShowUserInfo] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const markReadSnapshotRef = useRef("")

  const { data: conversationResponse, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["conversations", "detail", id],
    queryFn: () => conversationsApi.getById(id),
    enabled: !!id && !conversationFromStore,
  })

  const activeConversation = conversationFromStore ?? conversationResponse?.data ?? null

  useEffect(() => {
    if (!activeConversation?.id) return

    const unreadCount = activeConversation.countUnreadMessages ?? 0
    const hasUnread = activeConversation.isUnread || unreadCount > 0

    if (!hasUnread) {
      markReadSnapshotRef.current = ""
      return
    }

    const snapshot = `${activeConversation.id}:${unreadCount}:${activeConversation.isUnread ? 1 : 0}`
    if (markReadSnapshotRef.current === snapshot) return

    markReadSnapshotRef.current = snapshot
    markAsRead(activeConversation.id)
  }, [activeConversation?.countUnreadMessages, activeConversation?.id, activeConversation?.isUnread, markAsRead])

  const handleToggleUserInfo = useCallback(() => setShowUserInfo((prev) => !prev), [setShowUserInfo])
  const handleCloseUserInfo = useCallback(() => setShowUserInfo(false), [setShowUserInfo])

  if (isLoadingConversation && !activeConversation) return <ChatDetailSkeleton />
  if (!activeConversation) return <ChatDetailNotFound />

  // Mobile & Tablet
  if (!isDesktop) {
    return (
      <>
        <ChatDetailMessages
          conversation={activeConversation}
          showUserInfo={showUserInfo}
          onToggleUserInfo={handleToggleUserInfo}
        />
        <Sheet open={showUserInfo} onOpenChange={setShowUserInfo}>
          <SheetContent side="right" showCloseButton={false} className="w-80 p-0 sm:max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Thông tin người dùng</SheetTitle>
            </SheetHeader>
            <UserInfoPanel conversation={activeConversation} onClose={handleCloseUserInfo} />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop
  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel id="messages" minSize={50} className="min-w-0">
        <ChatDetailMessages
          conversation={activeConversation}
          showUserInfo={showUserInfo}
          onToggleUserInfo={handleToggleUserInfo}
        />
      </ResizablePanel>

      {showUserInfo && (
        <>
          <ResizableHandle className="bg-border" />
          <ResizablePanel
            id="user-info"
            defaultSize="300px"
            minSize="200px"
            maxSize="500px"
            className="overflow-hidden bg-background"
          >
            <div className="h-full">
              <UserInfoPanel conversation={activeConversation} onClose={handleCloseUserInfo} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
