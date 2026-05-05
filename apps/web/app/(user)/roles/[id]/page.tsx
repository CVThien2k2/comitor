import type { Metadata } from "next"
import { RoleDetailEditor } from "./_components/role-detail-editor"

export const metadata: Metadata = {
  title: "Chỉnh sửa vai trò",
  description: "Cập nhật vai trò và phân quyền",
}

export default async function RoleDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return (
    <div className="space-y-4 p-4 md:p-6">
      <RoleDetailEditor roleId={id} />
    </div>
  )
}
