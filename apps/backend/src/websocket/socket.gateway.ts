import { Logger, UseFilters } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { JwtService } from "@nestjs/jwt"
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { EVENTS, type SocketEvent } from "@workspace/shared"
import { Namespace, Socket } from "socket.io"
import { WsExceptionFilter } from "../common/filters/ws-exception.filter"
import { RoleService } from "../core/role/role.service"

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: { origin: "*", credentials: true },
  namespace: "websocket",
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace

  private readonly logger = new Logger(SocketGateway.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly roleService: RoleService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "") ||
        (client.handshake.query?.token as string)

      if (!token) {
        client.disconnect()
        return
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      })

      client.data.userId = payload.userId
      client.data.email = payload.email

      const userId = client.data.userId

      // Join user room
      const userRoom = `user:${userId}`
      await client.join(userRoom)

      // Join role room (dùng cache)
      const roleName = await this.roleService.getUserRoleName(userId)
      if (roleName) {
        client.data.roleName = roleName
        await client.join(`role:${roleName}`)
      }

      const room = this.server.adapter?.rooms?.get(userRoom)
      if (room && room.size === 1) {
        this.eventEmitter.emit(EVENTS.USER_ONLINE, { userId })
      }

      client.use(([event, ...args], next) => {
        this.logger.debug(`[${userId}] → ${event} ${JSON.stringify(args)}`)
        next()
      })

      this.logger.log(`Client connected: ${userId} (role: ${roleName ?? "none"})`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (!userId) return

    const userRoom = `user:${userId}`
    const adapter = this.server.adapter

    setTimeout(() => {
      const room = adapter?.rooms?.get(userRoom)
      if (!room || room.size === 0) {
        this.eventEmitter.emit(EVENTS.USER_OFFLINE, { userId })
      }
    }, 5000)

    this.logger.log(`Client disconnected: ${userId}`)
  }

  /** Gửi event đến user cụ thể */
  sendToUser(userIds: string[], event: SocketEvent, data?: unknown): boolean {
    try {
      let sent = false
      const adapter = this.server.adapter

      for (const userId of userIds) {
        const roomName = `user:${userId}`
        const room = adapter?.rooms?.get(roomName)
        if (room && room.size > 0) {
          this.server.to(roomName).emit(event, data || {})
          sent = true
        }
      }

      return sent
    } catch (error) {
      this.logger.error(`Error in sendToUser: ${error}`)
      return false
    }
  }

  /** Broadcast đến tất cả trừ user chỉ định */
  broadcastExcept(excludeUserIds: string[], event: SocketEvent, data?: unknown): void {
    const excludeRooms = excludeUserIds.map((id) => `user:${id}`)
    this.server.except(excludeRooms).emit(event, data || {})
  }

  /** Gửi event đến tất cả user trong 1 role */
  sendToRole(roleName: string, event: SocketEvent, data?: unknown): void {
    this.server.to(`role:${roleName}`).emit(event, data || {})
  }

  /** Gửi event đến 1 role, trừ user chỉ định */
  sendToRoleExcept(roleName: string, excludeUserIds: string[], event: SocketEvent, data?: unknown): void {
    const excludeRooms = excludeUserIds.map((id) => `user:${id}`)
    this.server.to(`role:${roleName}`).except(excludeRooms).emit(event, data || {})
  }

  /** Broadcast đến tất cả */
  broadcast(event: SocketEvent, data?: unknown): void {
    this.server.emit(event, data || {})
  }

}
