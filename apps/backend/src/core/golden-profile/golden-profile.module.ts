import { Module } from "@nestjs/common"
import { GoldenProfileService } from "./golden-profile.service"
import { GoldenProfileController } from "./golden-profile.controller"

@Module({
  controllers: [GoldenProfileController],
  providers: [GoldenProfileService],
  exports: [GoldenProfileService],
})
export class GoldenProfileModule {}
