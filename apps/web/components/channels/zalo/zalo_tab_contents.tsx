"use client"

import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import type { ApiResponse } from "@/lib/types"
import { Icons } from "@/components/global/icons"
import { api } from "@/lib/axios"
import { useCallback, useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

const ZALO_OA_PERMISSION_URL = process.env.NEXT_PUBLIC_ZALO_OA_REQUEST_PERMISSION_APP_URL ?? ""

interface ZaloPersonalSession {
  id?: string | null
  qrImage?: string | null
  status?: string | null
  displayName?: string | null
}

interface ZaloPersonalLinkedAccount {
  id: string
  provider: "zalo_personal"
  displayName: string | null
  accountId: string | null
  avatarUrl: string | null
}

interface ZaloPersonalLinkedStatusPayload {
  linked: boolean
  linkedAccount: ZaloPersonalLinkedAccount | null
}

type ZaloMode = "personal" | "oa"

type QrFlowErrorSource = "post" | "poll"

interface QrFlowError {
  statusCode: number | null
  message: string
  source: QrFlowErrorSource
}

interface ZaloTabContentsProps {
  open: boolean
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    console.error(error)
    return error.message
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message)
  }

  return "Không thể thực hiện yêu cầu. Vui lòng thử lại."
}

function getApiErrorMeta(error: unknown): { statusCode: number | null; message: string } {
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>
    const statusCode = typeof e.statusCode === "number" ? e.statusCode : null
    const message = typeof e.message === "string" && e.message.length > 0 ? e.message : getErrorMessage(error)
    return { statusCode, message }
  }

  return { statusCode: null, message: getErrorMessage(error) }
}

async function fetchLinkedStatusPayload(): Promise<ZaloPersonalLinkedStatusPayload> {
  const res = await api.get<ApiResponse<ZaloPersonalLinkedStatusPayload>>("/zalo-personal/status")
  return res.data ?? { linked: false, linkedAccount: null }
}

function ZaloPersonalLinkedAccountsList({ accounts }: { accounts: ZaloPersonalLinkedAccount[] }) {
  return (
    <div className="w-full max-w-md space-y-4 text-left">
      <div>
        <p className="font-medium text-foreground">Tài khoản Zalo cá nhân đã kết nối</p>
        <p className="mt-1 text-sm text-muted-foreground">Tài khoản dưới đây đã được liên kết với hệ thống.</p>
      </div>
      <ul className="space-y-2">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 text-left"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
              {account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- dynamic provider URL; no Next remotePatterns
                <Image src={account.avatarUrl} alt="" width={48} height={48} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Image src="/Zalo.png" alt="Zalo" width={32} height={32} className="size-8 object-contain" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{account.displayName ?? "Zalo cá nhân"}</p>
              {account.accountId ? (
                <p className="truncate text-xs text-muted-foreground">ID: {account.accountId}</p>
              ) : null}
            </div>
            <Icons.checkCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          </li>
        ))}
      </ul>
    </div>
  )
}

const ZaloTabContents = ({ open }: ZaloTabContentsProps) => {
  const [zaloMode, setZaloMode] = useState<ZaloMode>("personal")
  const [linkedStatus, setLinkedStatus] = useState<ZaloPersonalLinkedStatusPayload | null>(null)
  const [linkedStatusLoading, setLinkedStatusLoading] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [qrError, setQrError] = useState<QrFlowError | null>(null)
  const [isPersonalLoading, setIsPersonalLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) {
      setZaloMode("personal")
      setQrImage(null)
      setSessionId(null)
      setQrError(null)
      setIsPersonalLoading(false)
      setLinkedStatus(null)
      setLinkedStatusLoading(false)
    } else {
      setLinkedStatusLoading(true)
    }
  }, [open])

  const loadZaloPersonalQr = useCallback(async () => {
    setIsPersonalLoading(true)
    setQrError(null)
    setQrImage(null)
    setSessionId(null)

    try {
      const response = await api.post<ApiResponse<ZaloPersonalSession>>("/zalo-personal/login-qr")
      const session = response.data

      if (!session) {
        throw new Error("Không nhận được dữ liệu phiên đăng nhập.")
      }

      setQrImage(session.qrImage ?? null)
      setSessionId(session.id ?? null)
    } catch (error) {
      const meta = getApiErrorMeta(error)
      setQrError({ statusCode: meta.statusCode, message: meta.message, source: "post" })
    } finally {
      setIsPersonalLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open || zaloMode !== "personal") return

    let cancelled = false

    void (async () => {
      setLinkedStatusLoading(true)
      setQrError(null)
      setQrImage(null)
      setSessionId(null)

      let shouldLoadQr = true

      try {
        const payload = await fetchLinkedStatusPayload()
        if (cancelled) return
        setLinkedStatus(payload)
        if (payload.linked && payload.linkedAccount) {
          shouldLoadQr = false
        }
      } catch {
        if (cancelled) return
        setLinkedStatus({ linked: false, linkedAccount: null })
      } finally {
        if (!cancelled) setLinkedStatusLoading(false)
      }

      if (cancelled || !shouldLoadQr) return

      await loadZaloPersonalQr()
    })()

    return () => {
      cancelled = true
    }
  }, [open, zaloMode, loadZaloPersonalQr])

  useEffect(() => {
    if (!open || !sessionId) return

    const intervalId = window.setInterval(async () => {
      try {
        const response = await api.get<ApiResponse<ZaloPersonalSession>>(`/zalo-personal/login-qr/${sessionId}`)
        const session = response.data

        if (!session) {
          throw new Error("Không thể kiểm tra trạng thái đăng nhập.")
        }

        if (session.status === "authenticated") {
          window.clearInterval(intervalId)
          const payload = await fetchLinkedStatusPayload()
          if (payload.linked && payload.linkedAccount) {
            setLinkedStatus(payload)
            setQrImage(null)
            setSessionId(null)
            void queryClient.invalidateQueries({ queryKey: ["link-accounts"] })
          }
        } else if (session.status === "failed") {
          window.clearInterval(intervalId)
        }
      } catch (error) {
        window.clearInterval(intervalId)
        const payload = await fetchLinkedStatusPayload()
        if (payload.linked && payload.linkedAccount) {
          setLinkedStatus(payload)
          setQrImage(null)
          setSessionId(null)
        }
        const meta = getApiErrorMeta(error)
        setQrError({ statusCode: meta.statusCode, message: meta.message, source: "poll" })
      }
    }, 2000)

    return () => window.clearInterval(intervalId)
  }, [open, sessionId])

  const handleOpenExternalLink = (url: string) => {
    if (!url) return
    window.location.href = url
  }

  const linkedAccounts = linkedStatus?.linked && linkedStatus.linkedAccount ? [linkedStatus.linkedAccount] : []

  const errorTitle =
    qrError?.source === "post" && qrError.statusCode === 500
      ? "Không thể tải mã QR"
      : qrError?.source === "post"
        ? "Không thể tạo phiên đăng nhập"
        : qrError?.source === "poll" && qrError.statusCode === 500
          ? "Không thể kiểm tra trạng thái đăng nhập"
          : "Đã xảy ra lỗi"

  return (
    <Tabs
      value={zaloMode}
      onValueChange={(value) => setZaloMode(value as ZaloMode)}
      className="flex h-full flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">Kết nối Zalo</p>
          <p className="text-sm text-muted-foreground">Chọn loại tài khoản Zalo bạn muốn liên kết với hệ thống.</p>
        </div>
        <TabsList className="grid h-10 w-full max-w-[320px] grid-cols-2 bg-muted/70 p-1">
          <TabsTrigger value="personal" className="text-sm">
            Zalo cá nhân
          </TabsTrigger>
          <TabsTrigger value="oa" className="text-sm">
            ZaloOA
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="personal" className="mt-0 flex-1">
        <div className="grid h-full gap-5">
          <div className="rounded-2xl border bg-background/90 p-5 shadow-sm">
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              {linkedStatusLoading ? (
                <div className="space-y-3">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                    <Icons.spinner className="size-7 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Đang kiểm tra kết nối</p>
                    <p className="mt-1 text-sm text-muted-foreground">Vui lòng chờ trong giây lát...</p>
                  </div>
                </div>
              ) : linkedAccounts.length > 0 ? (
                <ZaloPersonalLinkedAccountsList accounts={linkedAccounts} />
              ) : isPersonalLoading ? (
                <div className="space-y-3">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                    <Icons.spinner className="size-7 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Đang tạo mã QR</p>
                    <p className="mt-1 text-sm text-muted-foreground">Vui lòng chờ trong giây lát...</p>
                  </div>
                </div>
              ) : qrImage ? (
                <div className="space-y-4">
                  <div className="mx-auto flex justify-center rounded-2xl border border-border/70 bg-white p-3 shadow-sm">
                    <Image
                      src={qrImage}
                      alt="Zalo QR"
                      width={224}
                      height={224}
                      unoptimized
                      className="size-56 rounded-xl object-contain"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quét mã bằng Zalo trên điện thoại để hoàn tất đăng nhập.
                  </p>
                </div>
              ) : qrError ? (
                <div className="space-y-4">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Icons.xCircle className="size-7" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{errorTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{qrError.message}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Image
                      src={"/Zalo.png"}
                      alt="Zalo"
                      className="size-10 shrink-0 object-contain"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Mã QR sẽ hiển thị tại đây</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Chọn tab Zalo cá nhân để tạo phiên đăng nhập mới.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="oa" className="mt-0 flex-1">
        <div className="rounded-2xl border bg-background/90 p-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src={"/Zalo.png"} alt="Zalo" className="size-10 shrink-0 object-contain" width={40} height={40} />
              <div>
                <p className="font-semibold text-foreground">Ủy quyền Zalo Official Account</p>
                <p className="text-sm text-muted-foreground">
                  Hệ thống sẽ chuyển bạn tới trang xác thực của ZaloOA để cấp quyền cho ứng dụng.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Sau khi hoàn tất ủy quyền, bạn sẽ được điều hướng về lại hệ thống để hoàn tất kết nối.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="gap-2"
                onClick={() => handleOpenExternalLink(ZALO_OA_PERMISSION_URL)}
                disabled={!ZALO_OA_PERMISSION_URL}
              >
                <Icons.externalLink className="size-4" />
                Đi tới trang ủy quyền ZaloOA
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default ZaloTabContents
