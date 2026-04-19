import { Module } from "@nestjs/common"
import { ZaloPersonalAuthService } from "./zalo_personal-auth.service"
import { ZaloPersonalClientFactory } from "./zalo_personal-client.factory"
import { ZaloPersonalListenerService } from "./zalo_personal-listener.service"
import { ZaloPersonalSessionService } from "./zalo_personal-session.service"
import { ZaloPersonalController } from "./zalo_personal.controller"
import { ZaloPersonalService } from "./zalo_personal.service"
import { ZaloPersonalMessageService } from "./zalo_personal-message.service"

@Module({
  controllers: [ZaloPersonalController],
  providers: [
    ZaloPersonalService,
    ZaloPersonalAuthService,
    ZaloPersonalSessionService,
    ZaloPersonalListenerService,
    ZaloPersonalClientFactory,
    ZaloPersonalMessageService,
  ],
  exports: [ZaloPersonalService, ZaloPersonalSessionService, ZaloPersonalMessageService],
})
export class ZaloPersonalModule {}
