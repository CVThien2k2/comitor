import { Module } from "@nestjs/common"
import { SuggestedMessageController } from "./suggested-message.controller"
import { SuggestedMessageService } from "./suggested-message.service"

@Module({
  controllers: [SuggestedMessageController],
  providers: [SuggestedMessageService],
  exports: [SuggestedMessageService],
})
export class SuggestedMessageModule {}
