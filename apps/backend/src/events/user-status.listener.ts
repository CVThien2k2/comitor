import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { UsersService } from "../core/users/users.service"
import type { UserStatusEvent } from "../websocket/socket-event-payloads"
import { EVENTS } from "../websocket/socket-events"
import { SocketGateway } from "../websocket/socket.gateway"
import { EMIT_EVENTS } from "./emit-events"

@Injectable()
export class UserStatusListener {
  private readonly logger = new Logger(UserStatusListener.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly socketGateway: SocketGateway
  ) {}

  @OnEvent(EMIT_EVENTS.USER_ONLINE)
  async handleUserOnline(event: UserStatusEvent) {
    try {
      await this.usersService.setOnlineStatus(event.userId, true)
      this.socketGateway.broadcast(EVENTS.USER_ONLINE, {
        userId: event.userId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.logger.error(`Error handling user online: ${error}`)
    }
  }

  @OnEvent(EMIT_EVENTS.USER_OFFLINE)
  async handleUserOffline(event: UserStatusEvent) {
    try {
      await this.usersService.setOnlineStatus(event.userId, false)
      this.socketGateway.broadcast(EVENTS.USER_OFFLINE, {
        userId: event.userId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.logger.error(`Error handling user offline: ${error}`)
    }
  }
}
