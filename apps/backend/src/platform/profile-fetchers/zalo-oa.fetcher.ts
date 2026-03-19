import { Injectable } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import { ZaloOaService } from "src/api/zalo_oa.service"
import type { ProfileFetcher, ProfileResult } from "./profile-fetcher.interface"

@Injectable()
export class ZaloOaProfileFetcher implements ProfileFetcher {
  constructor(private readonly zaloOaService: ZaloOaService) {}

  async getProfile(userId: string, _linkedAccount: LinkAccount): Promise<ProfileResult> {
    // return this.zaloOaService.getProfile(userId)
    // NOTE: hardcoded response for testing
    return {
      avatarUrl: "https://i.pravatar.cc/256?img=12",
      profile: {
        fullName: "Test Zalo OA User",
        primaryPhone: "0900000000",
        primaryEmail: "test.zalo.oa@example.com",
      },
    }
  }
}
