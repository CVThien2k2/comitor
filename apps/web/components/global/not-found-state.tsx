"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "@/components/global/icons"

export function NotFoundState() {
  return (
    <div className="flex h-full min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icons.alertCircle className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Trang không tồn tại</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đường dẫn bạn mở không hợp lệ hoặc nội dung đã bị di chuyển.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}
