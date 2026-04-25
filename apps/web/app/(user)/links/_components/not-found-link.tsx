import { Icons } from "@/components/global/icons"
import React from "react"

export const NotFoundLink = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icons.link className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">Chưa có tài khoản nào được liên kết</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        Khi bạn kết nối Zalo, Facebook, Email hoặc số điện thoại, các tài khoản sẽ xuất hiện tại đây theo dạng lưới để
        theo dõi nhanh trạng thái và người liên kết.
      </p>
    </div>
  )
}
