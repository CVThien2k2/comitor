import { Gender } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types/message"
import { normalizeDateOfBirth, normalizePrimaryPhone } from "../profile-normalizer"

export const mapUserProfile = (profile: any, userId: string): UserProfilePlatform => {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || profile?.name || "Unknown"
  const gender = profile?.gender
    ? profile?.gender === "male"
      ? Gender.male
      : profile?.gender === "female"
        ? Gender.female
        : Gender.other
    : undefined
  return {
    accountId: userId,
    fullName,
    avatarUrl: profile?.profile_pic,
    gender,
    dateOfBirth: normalizeDateOfBirth(profile?.birthday ?? profile?.birth_date),
    primaryPhone: normalizePrimaryPhone(profile?.phone ?? profile?.phone_number),
  }
}
