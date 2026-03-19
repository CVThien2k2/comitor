import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import type { ProfileFetcher, ProfileResult } from "./profile-fetcher.interface"

@Injectable()
export class ZaloPersonalProfileFetcher implements ProfileFetcher {
  private readonly logger = new Logger(ZaloPersonalProfileFetcher.name)

  async getProfile(userId: string, _linkedAccount: LinkAccount): Promise<ProfileResult> {
    this.logger.warn(`Zalo Personal chưa hỗ trợ getProfile cho userId: ${userId}`)
    throw new NotFoundException(`Zalo Personal chưa hỗ trợ getProfile cho userId: ${userId}`)
  }
}
