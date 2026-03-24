import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"

const channelIconMap: Record<string, string> = {
  zalo_oa: "/Zalo.png",
  zalo_personal: "/Zalo.png",
  facebook: "/Facebook.png",
  gmail: "/Gmail.png",
  phone: "/Stringee.png",
}

export function ChannelBadge({ provider }: { provider: string }) {
  const iconSrc = channelIconMap[provider] ?? "/icon.png"

  return (
    <span
      className={cn(
        "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-background"
      )}
    >
      <Image src={iconSrc} alt={provider} width={14} height={14} className="rounded-full object-contain" />
    </span>
  )
}
