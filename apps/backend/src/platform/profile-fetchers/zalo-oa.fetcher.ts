import { Injectable } from "@nestjs/common"
import type { GoldenProfile } from "@workspace/database"
import { ZaloOaService } from "src/api/zalo_oa.service"
import type { ProfileFetcher } from "./profile-fetcher.interface"

@Injectable()
export class ZaloOaProfileFetcher implements ProfileFetcher {
  constructor(private readonly zaloOaService: ZaloOaService) {}

  async getProfile(userId: string): Promise<Partial<GoldenProfile>> {
    return this.zaloOaService.getProfile(userId)
  }
}
