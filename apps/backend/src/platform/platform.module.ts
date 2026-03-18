import { Global, Module } from "@nestjs/common"
import { ApiModule } from "src/api/api.module"
import { ProfileFetcherRegistry } from "./profile-fetchers/profile-fetcher.registry"
import { ZaloOaProfileFetcher } from "./profile-fetchers/zalo-oa.fetcher"
import { MetaProfileFetcher } from "./profile-fetchers/meta.fetcher"
import { ZaloPersonalProfileFetcher } from "./profile-fetchers/zalo-personal.fetcher"

@Global()
@Module({
  imports: [ApiModule],
  providers: [ProfileFetcherRegistry, ZaloOaProfileFetcher, MetaProfileFetcher, ZaloPersonalProfileFetcher],
  exports: [ProfileFetcherRegistry],
})
export class PlatformModule {}
