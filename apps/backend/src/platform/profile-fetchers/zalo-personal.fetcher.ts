import { Injectable, Logger } from "@nestjs/common"
import type { ProfileFetcher } from "./profile-fetcher.interface"

@Injectable()
export class ZaloPersonalProfileFetcher implements ProfileFetcher {
  private readonly logger = new Logger(ZaloPersonalProfileFetcher.name)
  async getProfile() {}
}
