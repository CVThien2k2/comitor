"use client"

import { useEffect, useState, type CSSProperties } from "react"
import Image from "next/image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "@workspace/ui/components/sonner"
import { linkAccounts } from "@/api/link-accounts"
import { Icons } from "@/components/global/icons"

type ZaloLoginStatus = "qr_ready" | "scanned" | "success" | "expired" | "declined" | "error"

type ZaloLoginEvent = {
  status: ZaloLoginStatus
}

const steps = ["Mở ứng dụng Zalo trên điện thoại", "Ở mục Cài đặt, nhấn nút quét QR", "Quét mã QR để đăng nhập"]
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const shouldRefreshQr = (status: ZaloLoginStatus) => status === "expired" || status === "declined" || status === "error"

const confettiPieces = [
  { x: -128, y: -108, rotate: -28, color: "#22c55e", delay: 0 },
  { x: -98, y: -146, rotate: 34, color: "#10b981", delay: 80 },
  { x: -66, y: -116, rotate: 72, color: "#84cc16", delay: 40 },
  { x: -36, y: -154, rotate: -48, color: "#06b6d4", delay: 120 },
  { x: -12, y: -128, rotate: 18, color: "#22c55e", delay: 30 },
  { x: 24, y: -152, rotate: 56, color: "#facc15", delay: 90 },
  { x: 58, y: -118, rotate: -64, color: "#10b981", delay: 20 },
  { x: 94, y: -142, rotate: 40, color: "#38bdf8", delay: 110 },
  { x: 128, y: -104, rotate: -20, color: "#22c55e", delay: 50 },
  { x: -116, y: -48, rotate: 58, color: "#f59e0b", delay: 150 },
  { x: -72, y: -58, rotate: -76, color: "#06b6d4", delay: 60 },
  { x: 72, y: -56, rotate: 82, color: "#84cc16", delay: 140 },
  { x: 118, y: -42, rotate: -58, color: "#facc15", delay: 70 },
]

function QrLoadingPreview() {
  const skeletonBlocks = Array.from({ length: 49 })

  return (
    <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-xl bg-background">
      <style>
        {`
          @keyframes qr-logo-hop {
            0%, 100% { transform: translateY(0) scale(1); }
            38% { transform: translateY(-10px) scale(1.03); }
            68% { transform: translateY(2px) scale(0.985); }
          }

          @keyframes qr-logo-shadow {
            0%, 100% { transform: scaleX(1); opacity: 0.2; }
            38% { transform: scaleX(0.72); opacity: 0.1; }
            68% { transform: scaleX(1.08); opacity: 0.24; }
          }

          @keyframes qr-block-shimmer {
            0% { transform: translateX(-135%) skewX(-18deg); opacity: 0; }
            18% { opacity: 0.75; }
            52% { opacity: 0.75; }
            100% { transform: translateX(135%) skewX(-18deg); opacity: 0; }
          }

          .qr-loading-block::before {
            animation: qr-block-shimmer 2.1s ease-in-out var(--qr-delay) infinite;
          }
        `}
      </style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,var(--primary)_0%,transparent_42%)] opacity-[0.04]" />
      <div className="absolute inset-4 rounded-xl border border-primary/10 bg-muted/20 shadow-inner" />
      <div className="absolute inset-7 grid grid-cols-7 gap-1.5">
        {skeletonBlocks.map((_, index) => {
          const isQuiet = [3, 10, 17, 24, 31, 38, 45].includes(index)
          const isCorner = [0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43, 40, 41, 47, 48].includes(index)

          return (
            <span
              key={index}
              className="qr-loading-block relative overflow-hidden rounded-[4px] bg-primary/10 before:absolute before:inset-y-[-20%] before:w-1/2 before:bg-linear-to-r before:from-transparent before:via-white/75 before:to-transparent"
              style={
                {
                  "--qr-delay": `${index * 28}ms`,
                  opacity: isQuiet ? 0.18 : isCorner ? 0.72 : index % 3 === 0 ? 0.5 : 0.32,
                } as CSSProperties
              }
            />
          )
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.42)_44%,transparent_64%)] opacity-50" />

      <div className="relative flex flex-col items-center">
        <div
          className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/10 bg-background shadow-lg shadow-primary/10"
          style={{ animation: "qr-logo-hop 1.35s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" }}
        >
          <span
            className="absolute inset-[-8px] rounded-[1.35rem] border border-primary/10 bg-primary/3"
            style={{ animation: "qr-logo-hop 1.35s cubic-bezier(0.34, 1.56, 0.64, 1) 70ms infinite" }}
          />
          <Image src="/Zalo.png" alt="Zalo" width={36} height={36} className="size-9 object-contain" />
        </div>
        <span
          className="mt-3 h-2 w-12 rounded-full bg-primary/20 blur-[2px]"
          style={{ animation: "qr-logo-shadow 1.35s ease-in-out infinite" }}
        />
      </div>
    </div>
  )
}

function LoginSuccess({
  onAddAnother,
  onComplete,
  isFetching,
}: {
  onAddAnother: () => void
  onComplete?: () => void
  isFetching: boolean
}) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-8">
      <style>
        {`
          @keyframes success-check-pop {
            0% { transform: scale(0.45); opacity: 0; filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0)); }
            65% { transform: scale(1.12); opacity: 1; filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.9)); }
            100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.75)); }
          }

          @keyframes success-confetti {
            0% { transform: translate3d(0, 0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            12% { opacity: 1; }
            100% { transform: translate3d(var(--confetti-x), var(--confetti-y), 0) scale(1) rotate(var(--confetti-rotate)); opacity: 0; }
          }
        `}
      </style>

      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-6 flex size-36 items-center justify-center">
          {confettiPieces.map((piece, index) => (
            <span
              key={index}
              className="absolute top-1/2 left-1/2 h-2.5 w-1.5 rounded-sm"
              style={
                {
                  "--confetti-x": `${piece.x}px`,
                  "--confetti-y": `${piece.y}px`,
                  "--confetti-rotate": `${piece.rotate}deg`,
                  animation: `success-confetti 900ms cubic-bezier(0.16, 1, 0.3, 1) ${piece.delay}ms both`,
                  backgroundColor: piece.color,
                } as CSSProperties
              }
            />
          ))}

          <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Icons.check className="size-12" style={{ animation: "success-check-pop 520ms ease-out both" }} />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-2xl leading-8 font-semibold text-foreground">Đăng nhập thành công</h4>
          <p className="text-sm leading-6 text-muted-foreground">
            Tài khoản Zalo đã được kết nối. Hệ thống sẽ bắt đầu đồng bộ hội thoại và tin nhắn trong vài phút tới.
          </p>
        </div>

        <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button type="button" className="w-full sm:w-auto" onClick={onComplete}>
            <Icons.check className="size-4" />
            Hoàn tất
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onAddAnother} disabled={isFetching}>
            {isFetching ? <Icons.spinner className="size-4 animate-spin" /> : <Icons.plus className="size-4" />}
            Đăng nhập thêm tài khoản mới
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Zalo({ onComplete }: { onComplete?: () => void }) {
  const queryClient = useQueryClient()
  const [loginEvent, setLoginEvent] = useState<ZaloLoginEvent | null>(null)
  const {
    data: qr,
    isLoading,
    isError,
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
        void queryClient.invalidateQueries({ queryKey: ["link-accounts"] })
        events.close()
        return
      }

      if (shouldRefreshQr(nextEvent.status)) {
        if (nextEvent.status === "error") {
          toast.error("Có lỗi xảy ra khi đăng nhập, vui lòng thử lại sau")
        }

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
  }, [qr?.sessionId, queryClient, refetch])

  const currentStatus = loginEvent?.status ?? qr?.status
  const isLoginSuccess = currentStatus === "success"
  const isQrLoading = (isLoading || isFetching) && !isLoginSuccess
  const isScanned = currentStatus === "scanned"

  const handleAddAnotherAccount = () => {
    setLoginEvent(null)
    void refetch()
  }

  if (isLoginSuccess) {
    return <LoginSuccess onAddAnother={handleAddAnotherAccount} onComplete={onComplete} isFetching={isFetching} />
  }

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="mx-auto grid w-full max-w-[680px] grid-cols-1 items-center gap-6 md:grid-cols-[240px_minmax(0,1fr)] lg:max-w-[760px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="mx-auto flex size-[min(72vw,240px)] items-center justify-center rounded-2xl border bg-background p-3 shadow-sm ring-1 shadow-primary/5 ring-primary/5 md:size-[240px] lg:size-[260px]">
          {isQrLoading ? (
            <QrLoadingPreview />
          ) : qr?.qrCode ? (
            <div className="relative size-full">
              <Image
                src={qr.qrCode}
                alt="QR đăng nhập Zalo"
                width={220}
                height={220}
                unoptimized
                className="size-full rounded-xl bg-white object-contain p-2"
              />
              {isScanned ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                      <Icons.check className="size-7" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Đã quét mã</p>
                    <p className="max-w-36 text-xs leading-5 text-muted-foreground">
                      Xác nhận đăng nhập trên điện thoại
                    </p>
                  </div>
                </div>
              ) : null}
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
            <h4 className="text-xl leading-7 font-semibold text-foreground sm:text-2xl">Đăng nhập bằng mã QR</h4>
            <p className="text-sm text-muted-foreground">
              {isQrLoading
                ? "Hệ thống đang chuẩn bị mã QR đăng nhập Zalo."
                : isScanned
                  ? "Mã QR đã được quét, vui lòng xác nhận trên điện thoại."
                  : "Quét mã QR để đăng nhập Zalo"}
            </p>
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
