"use client"

import { conversations as conversationsApi } from "@/api/conversations"
import { useChatStore } from "@/stores/chat-store"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { ChatDetailMessages } from "./chat-detail-messages"
import { ChatDetailNotFound } from "./chat-detail-not-found"
import { ChatDetailSkeleton } from "./chat-detail-skeleton"

export function ChatDetail({ id }: { id: string }) {
  const { selectedConversation, setSelectedConversation } = useChatStore()

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

  if (isLoadingConversation) return <ChatDetailSkeleton />

  if (!selectedConversation) return <ChatDetailNotFound />
  return <ChatDetailMessages conversation={selectedConversation} />
}
