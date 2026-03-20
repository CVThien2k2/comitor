import { Injectable, Logger } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import { mapZaloPersonalProfileToGoldenProfile } from "src/api/utils/helper"
import { ZaloPersonalService } from "src/platform/zalo_personal/zalo_personal.service"
import type { ProfileFetcher, ProfileResult } from "./profile-fetcher.interface"

@Injectable()
export class ZaloPersonalProfileFetcher implements ProfileFetcher {
  private readonly logger = new Logger(ZaloPersonalProfileFetcher.name)

  constructor(private readonly zaloPersonalService: ZaloPersonalService) {}

  async getProfile(userId: string, linkedAccount: LinkAccount): Promise<ProfileResult> {
    this.logger.debug(`Fetching Zalo Personal profile for userId=${userId}, linkedAccountId=${linkedAccount.id}`)
    const profile = await this.zaloPersonalService.getUserProfile(userId, linkedAccount.id)

    return mapZaloPersonalProfileToGoldenProfile(profile, userId)
  }
}
