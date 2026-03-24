import { Module } from "@nestjs/common"
import { ZaloPersonalModule } from "../../platform/zalo_personal/zalo_personal.module"
import { LinkAccountService } from "./link-account.service"
import { LinkAccountController } from "./link-account.controller"

@Module({
  imports: [ZaloPersonalModule],
  controllers: [LinkAccountController],
  providers: [LinkAccountService],
  exports: [LinkAccountService],
})
export class LinkAccountModule {}
