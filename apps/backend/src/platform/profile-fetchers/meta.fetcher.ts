import { Injectable } from "@nestjs/common"
import type { GoldenProfile } from "@workspace/database"
import { MetaService } from "src/api/meta.service"
import type { ProfileFetcher } from "./profile-fetcher.interface"

@Injectable()
export class MetaProfileFetcher implements ProfileFetcher {
  constructor(private readonly metaService: MetaService) {}

  async getProfile(userId: string): Promise<Partial<GoldenProfile>> {
    return this.metaService.getProfile(userId)
  }
}
