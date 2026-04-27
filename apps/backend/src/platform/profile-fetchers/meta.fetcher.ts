import { Injectable, NotFoundException } from "@nestjs/common"
import type { ProfileFetcher } from "./profile-fetcher.interface"
import { LinkAccount } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types/message"
import { getUserProfile } from "../meta/api"
import { mapUserProfile } from "../meta/helper"

@Injectable()
export class MetaProfileFetcher implements ProfileFetcher {
  constructor() {}

  async getProfile(userId: string, linkedAccount: LinkAccount): Promise<UserProfilePlatform> {
    const pageAccessToken = (linkedAccount.credentials as any)?.pageAccessToken
    if (!pageAccessToken) throw new NotFoundException("Không tìm thấy Page Access Token của Facebook")

    const profile = await getUserProfile(userId, pageAccessToken)
    if (!profile) throw new NotFoundException("Không tìm thấy thông tin người dùng Facebook")
    return mapUserProfile(profile, userId)
  }
}
