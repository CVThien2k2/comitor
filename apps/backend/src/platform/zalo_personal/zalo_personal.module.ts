import { Module } from "@nestjs/common"
import { ZaloPersonalController } from "./zalo_personal.controller"
import { ZaloPersonalService } from "./zalo_personal.service"

@Module({
  controllers: [ZaloPersonalController],
  providers: [ZaloPersonalService],
})
export class ZaloPersonalModule {}
