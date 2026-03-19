import { Injectable } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import { MetaService } from "src/api/meta.service"
import type { ProfileFetcher, ProfileResult } from "./profile-fetcher.interface"

@Injectable()
export class MetaProfileFetcher implements ProfileFetcher {
  constructor(private readonly metaService: MetaService) {}

  async getProfile(userId: string, _linkedAccount: LinkAccount): Promise<ProfileResult> {
    return this.metaService.getProfile(userId)
  }
}
