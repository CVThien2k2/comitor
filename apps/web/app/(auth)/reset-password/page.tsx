import type { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form"

export const metadata: Metadata = ROUTES["reset-password"].metadata

interface ResetPasswordPageProps {
  searchParams: {
    token?: string
  }
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams.token ?? ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <ResetPasswordForm token={token} />
    </div>
  )
}
