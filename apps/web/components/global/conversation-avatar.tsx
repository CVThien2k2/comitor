import { memo, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { getAvatarColor, getInitials } from "@/lib/helper"
import { ChannelBadge } from "@/components/global/channel-badge"

type ConversationAvatarProps = {
  id: string
  name: string
  avatarUrl?: string | null
  provider?: string
  className?: string
}

const loadedAvatarSrcSet = new Set<string>()

export const ConversationAvatar = memo(function ConversationAvatar({
  id,
  name,
  avatarUrl,
  provider,
  className,
}: ConversationAvatarProps) {
  const initials = getInitials(name)
  const avatarColor = getAvatarColor(id)
  const [isImageReady, setIsImageReady] = useState(() => (!!avatarUrl ? loadedAvatarSrcSet.has(avatarUrl) : false))

  useEffect(() => {
    setIsImageReady(!!avatarUrl && loadedAvatarSrcSet.has(avatarUrl))
  }, [avatarUrl])

  return (
    <div className="relative shrink-0">
      <Avatar className={className ?? "size-10"}>
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt={name}
            onLoadingStatusChange={(status) => {
              if (status === "loaded") {
                loadedAvatarSrcSet.add(avatarUrl)
                setIsImageReady(true)
              }
              if (status === "error") {
                setIsImageReady(false)
              }
            }}
          />
        ) : null}
        <AvatarFallback
          delayMs={isImageReady ? 1000000 : 180}
          className="text-sm font-semibold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {provider ? <ChannelBadge provider={provider} /> : null}
    </div>
  )
})
