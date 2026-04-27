import { Injectable, Logger } from "@nestjs/common"
import type { ProfileFetcher } from "./profile-fetcher.interface"
import { LinkAccount } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types"
import { ZaloOaService } from "../zalo-oa/zalo-oa.service"

@Injectable()
export class ZaloOaProfileFetcher implements ProfileFetcher {
  private readonly logger = new Logger(ZaloOaProfileFetcher.name)
  constructor(private readonly zaloOaService: ZaloOaService) {}

  async getProfile(userId: string, linkedAccount: LinkAccount): Promise<UserProfilePlatform> {
    return await this.zaloOaService.getUserProfile(userId, linkedAccount)
  }
}
