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
  const selectedConversation = useChatStore((s) => s.selectedConversation)
  const setSelectedConversation = useChatStore((s) => s.setSelectedConversation)
  const hydrateConversation = useChatStore((s) => s.hydrateConversation)
  const showUserInfo = useChatStore((s) => s.showUserInfoPanel)
  const setShowUserInfo = useChatStore((s) => s.setShowUserInfoPanel)
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const activeConversation = selectedConversation?.id === id ? selectedConversation : null

  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["conversations", "detail", id],
    queryFn: () => conversationsApi.getById(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (!conversation?.data || isLoadingConversation) return

    hydrateConversation(conversation.data)

    if (selectedConversation?.id !== conversation.data.id) {
      setSelectedConversation(conversation.data)
    }
  }, [conversation?.data, hydrateConversation, isLoadingConversation, selectedConversation?.id, setSelectedConversation])

  const handleCloseUserInfo = useCallback(() => setShowUserInfo(false), [setShowUserInfo])

  if (isLoadingConversation && !activeConversation) return <ChatDetailSkeleton />
  if (!activeConversation) return <ChatDetailNotFound />

  if (!isDesktop) {
    return (
      <>
        <ChatDetailMessages />
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
              <UserInfoPanel conversation={activeConversation} onClose={handleCloseUserInfo} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
