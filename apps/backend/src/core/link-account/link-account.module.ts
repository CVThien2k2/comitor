import { Module } from "@nestjs/common"
import { LinkAccountService } from "./link-account.service"
import { LinkAccountController } from "./link-account.controller"

@Module({
  controllers: [LinkAccountController],
  providers: [LinkAccountService],
  exports: [LinkAccountService],
})
export class LinkAccountModule {}
