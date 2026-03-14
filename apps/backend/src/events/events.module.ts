import { Module } from "@nestjs/common"
import { UsersModule } from "../core/users/users.module"
import { UserStatusListener } from "./user-status.listener"

@Module({
  imports: [UsersModule],
  providers: [UserStatusListener],
})
export class EventsModule {}
