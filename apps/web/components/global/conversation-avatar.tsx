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

export function ConversationAvatar({ id, name, avatarUrl, provider, className }: ConversationAvatarProps) {
  const initials = getInitials(name)
  const avatarColor = getAvatarColor(id)

  return (
    <div className="relative shrink-0">
      <Avatar className={className ?? "size-10"}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="text-sm font-semibold text-white" style={{ backgroundColor: avatarColor }}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {provider ? <ChannelBadge provider={provider} /> : null}
    </div>
  )
}
