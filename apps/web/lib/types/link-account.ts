import { ChannelType, LinkAccountStatus } from "@workspace/database"

export type LinkAccountItem = {
  id: string
  provider: ChannelType
  displayName: string | null
  accountId: string | null
  avatarUrl: string | null
  status: LinkAccountStatus
  createdBy: string
  createdByUser: {
    id: string
    name: string
    avatarUrl: string | null
  }
  createdAt: string
  updatedAt: string
}

export type LinkAccountDetail = LinkAccountItem
