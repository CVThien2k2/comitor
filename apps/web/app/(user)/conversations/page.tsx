import { ROUTES } from "@/lib/routes"
import { Metadata } from "next"
import { ConversationListPanel } from "./_components/conversation-list"
import { EmptyState } from "./_components/empty-state"

export const metadata: Metadata = ROUTES.conversations.metadata

export default function ConversationsPage() {
  return (
    <>
      <div className="h-full md:hidden">
        <ConversationListPanel />
      </div>
      <div className="hidden h-full md:block">
        <EmptyState />
      </div>
    </>
  )
}
