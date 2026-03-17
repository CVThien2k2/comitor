import { Module } from "@nestjs/common"
import { UsersModule } from "../core/users/users.module"
import { UserStatusListener } from "./user-status.listener"
import { MessageListener } from "./message.listener"
import { MessageSenderRegistry } from "./message-senders/message-sender.registry"
import { ZaloOaSender } from "./message-senders/zalo-oa.sender"
import { FacebookSender } from "./message-senders/facebook.sender"
import { ZaloPersonalSender } from "./message-senders/zalo-personal.sender"

@Module({
  imports: [UsersModule],
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
