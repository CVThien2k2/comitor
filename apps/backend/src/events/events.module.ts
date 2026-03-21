import { Module } from "@nestjs/common"
import { UsersModule } from "../core/users/users.module"
import { MessageModule } from "../core/message/message.module"
import { UserStatusListener } from "./user-status.listener"
import { MessageListener } from "./message.listener"
import { MessageSenderRegistry } from "../platform/message-senders/message-sender.registry"
import { ZaloOaSender } from "../platform/message-senders/zalo-oa.sender"
import { FacebookSender } from "../platform/message-senders/facebook.sender"
import { ZaloPersonalSender } from "../platform/message-senders/zalo-personal.sender"
import { ZaloPersonalModule } from "src/platform/zalo_personal/zalo_personal.module"
import { ConversationModule } from "src/core/conversation/conversation.module"

@Module({
  imports: [UsersModule, MessageModule, ZaloPersonalModule, ConversationModule],
  providers: [
    UserStatusListener,
    MessageListener,
    MessageSenderRegistry,
    ZaloOaSender,
    FacebookSender,
    ZaloPersonalSender,
  ],
})
export class EventsModule {}
