import type { Metadata } from "next"
import { SuggestedMessageTable } from "./_components/suggested-message-table"

export const metadata: Metadata = {
  title: "Tin nhắn gợi ý",
  description: "Quản lý tin nhắn gợi ý",
}

export default function SuggestedMessagesPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <SuggestedMessageTable />
    </div>
  )
}

