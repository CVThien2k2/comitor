import { Module } from "@nestjs/common"
import { MessageService } from "./message.service"
import { MessageController } from "./message.controller"
import { ConversationModule } from "../conversation/conversation.module"

@Module({
  imports: [ConversationModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
