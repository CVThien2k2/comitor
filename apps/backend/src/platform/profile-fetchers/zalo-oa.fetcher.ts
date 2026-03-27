import { Injectable } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import { ZaloOaService } from "src/api/zalo_oa.service"
import type { ProfileFetcher, ProfileResult } from "./profile-fetcher.interface"

@Injectable()
export class ZaloOaProfileFetcher implements ProfileFetcher {
  constructor(private readonly zaloOaService: ZaloOaService) {}

  async getProfile(userId: string, linkedAccount: LinkAccount): Promise<ProfileResult> {
    if (!linkedAccount.accountId) {
      throw new Error(`LinkedAccount ${linkedAccount.id} chưa có accountId cho Zalo OA`)
    }
    return this.zaloOaService.getProfile(userId, linkedAccount.accountId)
  }
}
