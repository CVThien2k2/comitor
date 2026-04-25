"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { linkAccounts } from "@/api/link-accounts"
import { Icons } from "@/components/global/icons"

type ZaloLoginStatus = "qr_ready" | "scanned" | "success" | "expired" | "declined" | "error"

type ZaloLoginEvent = {
  status: ZaloLoginStatus
}

const steps = ["Mở ứng dụng Zalo trên điện thoại", "Ở mục Cài đặt, nhấn nút quét QR", "Quét mã QR để đăng nhập"]
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const statusText: Partial<Record<ZaloLoginStatus, string>> = {
  qr_ready: "Đang chờ quét mã QR",
  scanned: "Đã quét QR, vui lòng xác nhận trên điện thoại",
  success: "Đăng nhập Zalo thành công",
  expired: "QR Zalo đã hết hạn",
  declined: "Bạn đã từ chối đăng nhập trên Zalo",
  error: "Đăng nhập Zalo thất bại",
}

const shouldRefreshQr = (status: ZaloLoginStatus) => status === "expired" || status === "declined" || status === "error"

export default function Zalo() {
  const [loginEvent, setLoginEvent] = useState<ZaloLoginEvent | null>(null)
  const {
    data: qr,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["zalo", "login-qr"],
    queryFn: async () => {
      const data = await linkAccounts.loginZalo().then((res) => res.data)
      if (!data) throw new Error("Không nhận được mã QR từ máy chủ")
      setLoginEvent({ status: data.status })
      return data
    },
  })

  useEffect(() => {
    if (!qr?.sessionId) return
    const events = new EventSource(`${API_URL}/zalo/login/events/${qr.sessionId}`)
    events.onmessage = (event) => {
      const nextEvent = JSON.parse(event.data) as ZaloLoginEvent

      if (nextEvent.status === "success") {
        setLoginEvent(nextEvent)
        events.close()
        return
      }

      if (shouldRefreshQr(nextEvent.status)) {
        events.close()
        setLoginEvent(null)
        void refetch()
        return
      }

      setLoginEvent(nextEvent)
    }

    events.onerror = () => {
      events.close()
      setLoginEvent(null)
      void refetch()
    }

    return () => events.close()
  }, [qr?.sessionId, refetch])

  const currentStatus = loginEvent?.status ?? qr?.status
  const isLoginSuccess = currentStatus === "success"

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="mx-auto grid w-full max-w-[680px] grid-cols-1 items-center gap-6 md:grid-cols-[240px_minmax(0,1fr)] lg:max-w-[760px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="mx-auto flex size-[min(72vw,240px)] items-center justify-center rounded-2xl border bg-background p-4 shadow-sm md:size-[240px] lg:size-[260px]">
          {isLoading ? (
            <Icons.spinner className="size-8 animate-spin text-muted-foreground" />
          ) : isLoginSuccess ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <Icons.checkCircle2 className="size-9" />
              </div>
              <p className="text-sm font-medium text-foreground">{"Quét mã sau để"}</p>
            </div>
          ) : qr?.qrCode ? (
            <div className="relative size-full">
              <Image
                src={qr.qrCode}
                alt="QR đăng nhập Zalo"
                width={220}
                height={220}
                unoptimized
                className="size-full rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <Icons.alertCircle className="size-7 text-red-500" />
              <p className="text-sm text-muted-foreground">{"Không thể tạo mã QR đăng nhập"}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                disabled={!isError || isFetching}
              >
                <Icons.refreshCw className="size-4" />
                Tải lại
              </Button>
            </div>
          )}
        </div>
        <div className="mx-auto w-full max-w-md space-y-5 text-center md:max-w-none md:text-left">
          <div className="space-y-2">
            <h4 className="text-xl leading-7 font-semibold text-foreground sm:text-2xl">Quét để kết nối</h4>
            {!isLoading && qr?.qrCode ? (
              <p className={isLoginSuccess ? "text-sm text-emerald-600" : "text-sm text-muted-foreground"}>
                {"Quét mã QR để đăng nhập Zalo"}
              </p>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-5">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 text-left">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-start gap-2 text-left text-sm text-red-500">
            <Icons.alertCircle className="mt-0.5 size-4 shrink-0" />
            <p>
              Sau khi đăng nhập, bạn vui lòng KHÔNG quét đăng nhập lại trên Zalo phiên bản website để tránh làm gián
              đoạn luồng tin nhắn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
