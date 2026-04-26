"use client"

import { Icons } from "@/components/global/icons"
import { API_URL } from "@/lib/constants"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"

const permissions = [
  "Nhận và quản lý hội thoại từ Official Account",
  "Gửi phản hồi chăm sóc khách hàng qua Zalo OA",
  "Đồng bộ thông tin người quan tâm và trạng thái kết nối",
]

export default function ZaloOa() {
  const handleConnect = () => {
    window.location.href = `${API_URL}/platform/zalo-oa/connect`
  }

  return (
    <div className="flex min-h-full items-center justify-center">
      <style>
        {`
          @keyframes zalo-oa-fade-up {
            from { transform: translateY(8px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes zalo-oa-pulse {
            0%, 100% { transform: scale(1); opacity: 0.55; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }

          .zalo-oa-enter {
            animation: zalo-oa-fade-up 420ms ease-out both;
          }
        `}
      </style>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 text-center">
        <div className="zalo-oa-enter relative flex size-16 items-center justify-center rounded-2xl border border-primary/10 text-primary-foreground shadow-sm">
          <span
            className="absolute inset-0 rounded-2xl"
            style={{ animation: "zalo-oa-pulse 1.8s ease-in-out infinite" }}
          />
          <Image src="/Zalo.png" alt="Zalo OA" width={36} height={36} className="relative size-9 object-contain" />
        </div>

        <div className="zalo-oa-enter space-y-2" style={{ animationDelay: "80ms" }}>
          <p className="text-sm font-medium text-primary">Official Account</p>
          <h4 className="text-2xl leading-8 font-semibold text-foreground">Kết nối Zalo OA</h4>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            Đăng nhập bằng tài khoản quản trị OA. Backend sẽ xử lý callback, đổi token và lưu kết nối sau khi Zalo xác
            thực thành công.
          </p>
        </div>

        <div
          className="zalo-oa-enter w-full rounded-2xl border bg-background p-4 text-left"
          style={{ animationDelay: "150ms" }}
        >
          <div className="space-y-3">
            {permissions.map((permission, index) => (
              <div
                key={permission}
                className="flex items-start gap-3"
                style={{ animation: `zalo-oa-fade-up 360ms ease-out ${220 + index * 70}ms both` }}
              >
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Icons.check className="size-3.5" />
                </div>
                <p className="text-sm leading-6 text-foreground">{permission}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="zalo-oa-enter flex w-full items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-left text-sm text-amber-700 dark:text-amber-300"
          style={{ animationDelay: "320ms" }}
        >
          <Icons.shield className="mt-0.5 size-4 shrink-0" />
          <p>Hãy dùng tài khoản Zalo có quyền quản trị Official Account cần kết nối.</p>
        </div>

        <Button
          type="button"
          size="lg"
          className="zalo-oa-enter w-full sm:w-auto"
          style={{ animationDelay: "400ms" }}
          onClick={handleConnect}
        >
          <Icons.externalLink className="size-4" />
          Kết nối Zalo OA
        </Button>
      </div>
    </div>
  )
}
