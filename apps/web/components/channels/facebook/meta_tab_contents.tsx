"use client"

import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "@/components/global/icons"
import { buildMetaOAuthUrl } from "./meta_oauth"

function handleOpenExternalLink(url: string) {
  if (!url) return
  window.location.assign(url)
}

const MetaTabContents = () => {
  const metaOAuthUrl = buildMetaOAuthUrl()

  return (
    <div className="flex h-full min-h-[360px] items-center justify-center">
      <div className="flex max-w-lg flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-blue-50">
          <Image
            src={"/Facebook.png"}
            alt="Facebook"
            className="size-10 shrink-0 object-contain"
            width={40}
            height={40}
          />
        </div>

        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">Kết nối Facebook Page</p>
          <p className="text-sm text-muted-foreground">
            Dùng tài khoản Facebook quản trị Page để cấp quyền đọc và gửi tin nhắn Messenger.
          </p>
          <p className="text-sm text-muted-foreground">
            Sau khi xác thực trên Facebook, hệ thống sẽ tự động hoàn tất việc liên kết Page với hộp thư của bạn.
          </p>
        </div>

        <Button
          type="button"
          className="mx-auto gap-2"
          onClick={() => handleOpenExternalLink(metaOAuthUrl)}
          disabled={!metaOAuthUrl}
        >
          <Icons.externalLink className="size-4" />
          Đi tới Facebook để kết nối
        </Button>
      </div>
    </div>
  )
}

export default MetaTabContents
