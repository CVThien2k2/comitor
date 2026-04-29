import { ChannelType, Gender } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types"
import { normalizeDateOfBirth, normalizePrimaryPhone } from "../profile-normalizer"

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
    dateOfBirth: normalizeDateOfBirth(user.birth_date),
    primaryPhone: normalizePrimaryPhone(user.shared_info?.phone),
  }
}
