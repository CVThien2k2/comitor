import { Global, Module } from "@nestjs/common"
import { ApiModule } from "src/api/api.module"
import { ZaloPersonalModule } from "./zalo_personal/zalo_personal.module"
import { ProfileFetcherRegistry } from "./profile-fetchers/profile-fetcher.registry"
import { ZaloOaProfileFetcher } from "./profile-fetchers/zalo-oa.fetcher"
import { MetaProfileFetcher } from "./profile-fetchers/meta.fetcher"
import { ZaloPersonalProfileFetcher } from "./profile-fetchers/zalo-personal.fetcher"
import { ZaloPersonalSender } from "./message-senders/zalo-personal.sender"
import { ConversationModule } from "src/core/conversation/conversation.module"

@Global()
@Module({
  imports: [ApiModule, ZaloPersonalModule, ConversationModule],
  providers: [
    ProfileFetcherRegistry,
    ZaloOaProfileFetcher,
    MetaProfileFetcher,
    ZaloPersonalProfileFetcher,
    ZaloPersonalSender,
  ],
  exports: [ProfileFetcherRegistry],
})
export class PlatformModule {}
