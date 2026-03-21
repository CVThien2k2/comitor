import { ROUTES } from "@/lib/routes"
import { Metadata } from "next"
import { ConversationsContent } from "./conversations-content"

export const metadata: Metadata = ROUTES.conversations.metadata

export default function ConversationsPage() {
  return <ConversationsContent />
}
