import { AuthWrapper } from "@/components/providers/auth-wrapper"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthWrapper>{children}</AuthWrapper>
}
