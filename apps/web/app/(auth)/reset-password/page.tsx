import type { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form"

export const metadata: Metadata = ROUTES["reset-password"].metadata

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm token={token ?? ""} />
    </div>
  )
}
