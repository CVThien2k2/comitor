import { Injectable, Logger } from "@nestjs/common"
import type { GoldenProfile } from "@workspace/database"
import type { ProfileFetcher } from "./profile-fetcher.interface"

@Injectable()
export class ZaloPersonalProfileFetcher implements ProfileFetcher {
  private readonly logger = new Logger(ZaloPersonalProfileFetcher.name)

  async getProfile(userId: string): Promise<Partial<GoldenProfile>> {
    this.logger.warn(`Zalo Personal chưa hỗ trợ getProfile cho userId: ${userId}`)
    return {}
  }
}
