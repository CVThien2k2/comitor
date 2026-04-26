import { Injectable } from "@nestjs/common"
import type { ProfileFetcher } from "./profile-fetcher.interface"

@Injectable()
export class ZaloOaProfileFetcher implements ProfileFetcher {
  constructor() {}

  async getProfile() {}
}
