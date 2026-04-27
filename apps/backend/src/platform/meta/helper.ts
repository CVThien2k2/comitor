import { Gender } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types/message"

export const mapUserProfile = (profile: any, userId: string): UserProfilePlatform => {
  const fullName = profile?.first_name + " " + profile?.last_name || "Unknown"
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
  }
}
