import { Module } from "@nestjs/common"
import { ConversationService } from "./conversation.service"
import { ConversationController } from "./conversation.controller"
import { ZaloPersonalModule } from "src/platform/zalo_personal/zalo_personal.module"

@Module({
  imports: [ZaloPersonalModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
