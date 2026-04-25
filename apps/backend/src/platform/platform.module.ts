import { Global, Module } from "@nestjs/common"
import { ApiModule } from "src/api/api.module"
import { ProfileFetcherRegistry } from "./profile-fetchers/profile-fetcher.registry"
import { ZaloOaProfileFetcher } from "./profile-fetchers/zalo-oa.fetcher"
import { MetaProfileFetcher } from "./profile-fetchers/meta.fetcher"
import { ZaloPersonalProfileFetcher } from "./profile-fetchers/zalo-personal.fetcher"
import { ZaloPersonalSender } from "./message-senders/zalo-personal.sender"
import { ConversationModule } from "src/core/conversation/conversation.module"
import { WebhookController } from "./webhook/webhook.controller"
import { WebhookService } from "./webhook/webhook.service"
import { ZaloController } from "./zalo/zalo.controller"
import { ZaloInstanceRegistry } from "./zalo/zalo-instance.registry"
import { ZaloService } from "./zalo/zalo.service"

@Global()
@Module({
  imports: [ApiModule, ConversationModule],
  controllers: [WebhookController, ZaloController],
  providers: [
    ProfileFetcherRegistry,
    ZaloOaProfileFetcher,
    MetaProfileFetcher,
    ZaloPersonalProfileFetcher,
    ZaloPersonalSender,
    WebhookService,
    ZaloInstanceRegistry,
    ZaloService,
  ],
  exports: [ProfileFetcherRegistry],
})
export class PlatformModule {}
