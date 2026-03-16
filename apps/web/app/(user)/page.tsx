"use client"

import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { auth } from "@/api/auth"
import { useAuthStore } from "@/stores/auth-store"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await auth.logout()
    } finally {
      logout()
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thông tin người dùng</CardTitle>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">{JSON.stringify(user, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
