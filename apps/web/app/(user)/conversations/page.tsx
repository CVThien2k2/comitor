import { ROUTES } from "@/lib/routes"
import { Metadata } from "next"
import { ConversationsPage as ConversationsPageContent } from "@/components/conversations/conversations-page"

export const metadata: Metadata = ROUTES.conversations.metadata

export default function ConversationsPage() {
  return <ConversationsPageContent />
}
