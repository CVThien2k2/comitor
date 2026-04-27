import { Injectable, NotFoundException } from "@nestjs/common"
import { LinkAccount } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types/message"
import { mapUserProfile } from "../zalo/helper"
import { ZaloInstanceRegistry } from "../zalo/zalo-instance.registry"
import type { ProfileFetcher } from "./profile-fetcher.interface"

@Injectable()
export class ZaloPersonalProfileFetcher implements ProfileFetcher {
  constructor(private readonly zaloInstanceRegistry: ZaloInstanceRegistry) {}

  async getProfile(userId: string, linkedAccount: LinkAccount): Promise<UserProfilePlatform> {
    const api = this.zaloInstanceRegistry.get(linkedAccount.id)
    if (!api) throw new NotFoundException("Zalo cá nhân không tồn tại")
      const res = await api.getUserInfo(userId)
      const user = res?.changed_profiles?.[userId]
      if (!user) throw new NotFoundException("Không tìm thấy thông tin người dùng")
      return mapUserProfile(user)
  }
}
