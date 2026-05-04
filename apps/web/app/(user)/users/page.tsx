import { Metadata } from "next"
import { UserTable } from "./_components/user-table"

export const metadata: Metadata = {
  title: "Quản lý người dùng",
  description: "Quản lý người dùng nội bộ",
}

export default function UsersPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <UserTable />
    </div>
  )
}
