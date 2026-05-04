import { Metadata } from "next"
import { RoleTable } from "./_components/role-table"

export const metadata: Metadata = {
  title: "Quản lý vai trò",
  description: "Quản lý danh sách vai trò",
}

export default function RolesPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <RoleTable />
    </div>
  )
}
