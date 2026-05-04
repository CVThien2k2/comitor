import { Metadata } from "next"
import { PermissionTable } from "./_components/permission-table"

export const metadata: Metadata = {
  title: "Quản lý quyền",
  description: "Quản lý danh sách quyền",
}

export default function PermissionsPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <PermissionTable />
    </div>
  )
}
