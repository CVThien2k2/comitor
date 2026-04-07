"use client"

import { useEffect } from "react"
import { AuthWrapper } from "@/components/providers/auth-wrapper"
import { AppShell } from "@/components/sidebar/app-shell"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow

    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [])

  return (
    <AuthWrapper>
      <AppShell>{children}</AppShell>
    </AuthWrapper>
  )
}
