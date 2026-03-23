import { Icons } from "@/components/global/icons"
import { channelConfig } from "@/lib/helper"
import { cn } from "@workspace/ui/lib/utils"

const channelIconMap: Record<string, React.FC<{ className?: string }>> = {
  zalo_oa: Icons.zalo,
  zalo_personal: Icons.zalo,
  facebook: Icons.facebook,
  gmail: Icons.gmail,
  phone: Icons.phoneChannel,
}

export function ChannelBadge({ provider }: { provider: string }) {
  const Icon = channelIconMap[provider] ?? Icons.website
  const config = channelConfig[provider] ?? { color: "text-muted-foreground", bg: "bg-muted" }

  return (
    <span
      className={cn(
        "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background",
        config.bg,
        config.color
      )}
    >
      <Icon />
    </span>
  )
}
