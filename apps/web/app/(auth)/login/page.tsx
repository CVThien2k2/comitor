import type { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { LoginForm } from "@/app/(auth)/login/login-form"

export const metadata: Metadata = ROUTES["sign-in"].metadata

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
