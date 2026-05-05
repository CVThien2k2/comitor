import { Metadata } from "next"
import { Suspense } from "react"
import { ProfileDetailForm, ProfileDetailFormSkeleton } from "./_components/profile-detail-form"

export const metadata: Metadata = {
  title: "Chi tiết hồ sơ khách hàng",
  description: "Xem và chỉnh sửa chi tiết hồ sơ khách hàng",
}

export default async function ProfileDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Suspense fallback={<ProfileDetailFormSkeleton />}>
        <ProfileDetailForm profileId={id} />
      </Suspense>
    </div>
  )
}
