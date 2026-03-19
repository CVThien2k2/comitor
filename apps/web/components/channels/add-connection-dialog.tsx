"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "@/components/global/icons"

const ZALO_OA_PERMISSION_URL = process.env.NEXT_PUBLIC_ZALO_OA_REQUEST_PERMISSION_APP_URL ?? ""
const META_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? ""
const META_OAUTH_SCOPE =
  "pages_show_list,pages_messaging,pages_manage_metadata,business_management,pages_read_engagement"

function getMetaRedirectUri(): string {
  const env = process.env.NEXT_PUBLIC_ENV
  if (env === "production") {
    return process.env.NEXT_PUBLIC_META_REDIRECT_URI_PRODUCTION ?? ""
  }
  return process.env.NEXT_PUBLIC_META_REDIRECT_URI_DEV ?? ""
}

function buildMetaOAuthUrl(): string {
  const redirectUri = getMetaRedirectUri()
  const params = new URLSearchParams({
    client_id: META_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPE,
    response_type: "code",
  })
  return `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`
}

interface AddConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddConnectionDialog({ open, onOpenChange }: AddConnectionDialogProps) {
  const channels = [
    {
      id: "zalo_oa",
      name: "Zalo Official Account",
      description: "Kết nối Zalo OA để nhận và gửi tin nhắn",
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <rect width="48" height="48" rx="12" fill="#0068FF" />
          <path d="M32.5 15.5H15.5C14.12 15.5 13 16.62 13 18V30C13 31.38 14.12 32.5 15.5 32.5H20.5L24 36L27.5 32.5H32.5C33.88 32.5 35 31.38 35 30V18C35 16.62 33.88 15.5 32.5 15.5ZM19.5 27H17V24.5H19.5V27ZM19.5 23H17V20.5H19.5V23ZM26.25 27H21.75V24.5H26.25V27ZM26.25 23H21.75V20.5H26.25V23ZM31 27H28.5V24.5H31V27ZM31 23H28.5V20.5H31V23Z" fill="white" />
        </svg>
      ),
      hoverColor: "hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
      onClick: () => {
        if (ZALO_OA_PERMISSION_URL) window.location.href = ZALO_OA_PERMISSION_URL
      },
      disabled: !ZALO_OA_PERMISSION_URL,
    },
    {
      id: "facebook",
      name: "Facebook Messenger",
      description: "Kết nối Facebook Page để quản lý tin nhắn Messenger",
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <defs>
            <linearGradient id="fbGradientDialog" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#00C6FF" />
              <stop offset="100%" stopColor="#0078FF" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#fbGradientDialog)" />
          <path d="M34.48 24.36L33.06 32.96C33.01 33.28 32.76 33.53 32.44 33.58C32.38 33.59 32.31 33.59 32.25 33.57L27.29 32.19C27.05 32.12 26.83 31.98 26.68 31.78L23.97 28.14L21.28 31.84C21.14 32.04 20.92 32.18 20.68 32.25L15.72 33.71C15.39 33.81 15.04 33.68 14.85 33.4C14.76 33.26 14.72 33.1 14.73 32.93L15.3 24.39C15.33 24.03 15.57 23.73 15.91 23.62L20.45 22.16L24 17L27.55 22.13L32.1 23.54C32.44 23.64 32.69 23.94 32.72 24.3L34.48 24.36Z" fill="white" />
        </svg>
      ),
      hoverColor: "hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20",
      onClick: () => {
        const url = buildMetaOAuthUrl()
        if (url && META_OAUTH_CLIENT_ID) window.location.href = url
      },
      disabled: !META_OAUTH_CLIENT_ID,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm kênh kết nối</DialogTitle>
          <DialogDescription>Chọn kênh bạn muốn kết nối với hệ thống</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="outline"
              className={`flex items-center gap-4 h-auto p-4 justify-start ${channel.hoverColor}`}
              onClick={channel.onClick}
              disabled={channel.disabled}
            >
              {channel.icon}
              <div className="text-left">
                <p className="font-semibold text-foreground">{channel.name}</p>
                <p className="text-sm text-muted-foreground font-normal">{channel.description}</p>
              </div>
              <Icons.externalLink className="w-4 h-4 ml-auto text-muted-foreground shrink-0" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
