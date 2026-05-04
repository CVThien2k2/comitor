import { Metadata } from "next"
import { ProfileTable } from "./_components/profile-table"

export const metadata: Metadata = {
  title: "Hồ sơ khách hàng",
  description: "Quản lý hồ sơ khách hàng",
}

export default function ProfilesPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <ProfileTable />
    </div>
  )
}
