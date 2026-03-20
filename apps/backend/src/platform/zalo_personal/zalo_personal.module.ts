import { Module } from "@nestjs/common"
import { ZaloPersonalController } from "./zalo_personal.controller"
import { ZaloPersonalAuthService } from "./zalo_personal-auth.service"
import { ZaloPersonalClientFactory } from "./zalo_personal-client.factory"
import { ZaloPersonalListenerService } from "./zalo_personal-listener.service"
import { ZaloPersonalSessionService } from "./zalo_personal-session.service"
import { ZaloPersonalService } from "./zalo_personal.service"

@Module({
  controllers: [ZaloPersonalController],
  providers: [
    ZaloPersonalService,
    ZaloPersonalAuthService,
    ZaloPersonalSessionService,
    ZaloPersonalListenerService,
    ZaloPersonalClientFactory,
  ],
  exports: [ZaloPersonalService],
})
export class ZaloPersonalModule {}
