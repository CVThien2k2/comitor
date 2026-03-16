import type { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form"

export const metadata: Metadata = ROUTES["forgot-password"].metadata

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <ForgotPasswordForm />
    </div>
  )
}
