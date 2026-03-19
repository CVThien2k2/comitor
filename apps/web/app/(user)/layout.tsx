import { AuthWrapper } from "@/components/providers/auth-wrapper"
import { AppShell } from "@/components/app-shell"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
  <AuthWrapper>
    <AppShell>
      {children}
    </AppShell>
  </AuthWrapper>
  )
}
