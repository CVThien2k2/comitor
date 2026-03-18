import { Injectable } from "@nestjs/common"
import type { ProfileFetcher } from "./profile-fetcher.interface"
import { ZaloOaProfileFetcher } from "./zalo-oa.fetcher"
import { MetaProfileFetcher } from "./meta.fetcher"
import { ZaloPersonalProfileFetcher } from "./zalo-personal.fetcher"

@Injectable()
export class ProfileFetcherRegistry {
  private readonly fetchers: Map<string, ProfileFetcher>

  constructor(
    private readonly zaloOa: ZaloOaProfileFetcher,
    private readonly meta: MetaProfileFetcher,
    private readonly zaloPersonal: ZaloPersonalProfileFetcher
  ) {
    this.fetchers = new Map<string, ProfileFetcher>([
      ["zalo_oa", this.zaloOa],
      ["facebook", this.meta],
      ["zalo_personal", this.zaloPersonal],
    ])
  }

  get(provider: string): ProfileFetcher | undefined {
    return this.fetchers.get(provider)
  }
}
