import type { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password-form"

export const metadata: Metadata = ROUTES["forgot-password"].metadata

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  )
}
