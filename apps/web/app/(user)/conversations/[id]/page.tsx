import { ROUTES } from "@/lib/routes"
import { Metadata } from "next"
import { ChatDetail } from "./chat-detail"

export const metadata: Metadata = ROUTES.conversationDetail.metadata

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return <ChatDetail id={id} />
}
