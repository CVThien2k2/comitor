"use client"

import { Icons } from "@/components/global/icons"

export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <Icons.messageSquare className="size-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">Chọn một hội thoại</p>
        <p className="text-sm mt-1">
          Chọn một hội thoại từ danh sách bên trái để bắt đầu
        </p>
      </div>
    </div>
  )
}
