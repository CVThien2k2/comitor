import { Module } from "@nestjs/common"
import { ZaloOaService } from "src/platform/zalo-oa/zalo-oa.service"
import { ZaloInstanceRegistry } from "src/platform/zalo/zalo-instance.registry"
import { ZaloService } from "src/platform/zalo/zalo.service"
import { LinkAccountReconnectService } from "./link-account-reconnect.service"
import { LinkAccountService } from "./link-account.service"
import { LinkAccountController } from "./link-account.controller"

@Module({
  controllers: [LinkAccountController],
  providers: [LinkAccountService, LinkAccountReconnectService, ZaloInstanceRegistry, ZaloService, ZaloOaService],
  exports: [LinkAccountService, LinkAccountReconnectService, ZaloInstanceRegistry, ZaloService, ZaloOaService],
})
export class LinkAccountModule {}
