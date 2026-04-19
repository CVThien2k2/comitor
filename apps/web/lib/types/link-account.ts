import type { ChannelType, LinkAccount as DbLinkAccount } from "@workspace/database"

export type { ChannelType }

export type LinkAccountItem = DbLinkAccount & {
  linkedByUser: { id: string; name: string }
}

export type LinkAccountDetail = DbLinkAccount & {
  linkedByUser: { id: string; name: string; avatarUrl: string | null }
}
