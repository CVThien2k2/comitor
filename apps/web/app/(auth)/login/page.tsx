import type { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { SignInForm } from "@/app/(auth)/login/sign-in-form"

export const metadata: Metadata = ROUTES["sign-in"].metadata

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <SignInForm />
    </div>
  )
}
