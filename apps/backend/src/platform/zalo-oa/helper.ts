import { ChannelType } from "@workspace/database"

export const mapAccountInfo = (profile: any) => {
  return {
    provider: "zalo_oa" as ChannelType,
    accountId: profile.oa_id,
    displayName: profile.name,
    avatarUrl: profile.avatar,
  }
}
