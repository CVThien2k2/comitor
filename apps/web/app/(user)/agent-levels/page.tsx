import type { Metadata } from "next"
import { AgentLevelTable } from "./_components/agent-level-table"

export const metadata: Metadata = {
  title: "Quản lý cấp độ nhân viên",
  description: "Quản lý danh sách cấp độ nhân viên",
}

export default function AgentLevelsPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <AgentLevelTable />
    </div>
  )
}
