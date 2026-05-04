import { Metadata } from "next"
import { AccountCustomerTable } from "./_components/account-customer-table"

export const metadata: Metadata = {
  title: "Tài khoản khách hàng",
  description: "Quản lý tài khoản khách hàng",
}

export default function CustomersPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <AccountCustomerTable />
    </div>
  )
}
