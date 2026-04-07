import type { Metadata } from "next"
import { AccountsManagementPage } from "@/components/accounts/accounts-management-page"

export const metadata: Metadata = {
  title: "Quản lý tài khoản",
  description: "Quản lý tài khoản nội bộ",
  robots: "noindex, nofollow",
}

export default function AccountsPage() {
  return <AccountsManagementPage />
}
