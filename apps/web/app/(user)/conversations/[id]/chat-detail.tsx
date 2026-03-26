"use client"

import { conversations as conversationsApi } from "@/api/conversations"
import { useChatStore } from "@/stores/chat-store"
import { useQuery } from "@tanstack/react-query"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"
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
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel id="messages" minSize={50} className="min-w-0">
        <ChatDetailMessages />
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
              <UserInfoPanel conversation={selectedConversation} onClose={handleCloseUserInfo} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
