import { ChannelType, Gender } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types"

export const mapAccountInfo = (profile: any) => {
  return {
    provider: "zalo_oa" as ChannelType,
    accountId: profile.oa_id,
    displayName: profile.name,
    avatarUrl: profile.avatar,
  }
}

export const mapUserProfile = (user: any): UserProfilePlatform => {
  return {
    accountId: user.user_id,
    fullName: user.display_name || "Unknown",
    avatarUrl: user.avatar,
    gender: Gender.other,
    dateOfBirth: user.birth_date ? String(user.birth_date) : undefined,
    primaryPhone: user.shared_info?.phone,
  }
}
