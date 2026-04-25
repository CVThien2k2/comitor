import { Injectable, Logger } from "@nestjs/common"
import { ConversationService } from "./core/conversation/conversation.service"
import { User } from "@workspace/database"
import { PrismaService } from "./database/prisma.service"
import { RedisService } from "./redis/redis.service"
import { PermissionService } from "./core/permission/permission.service"

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  constructor(
    private readonly conversationService: ConversationService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly permissionService: PermissionService
  ) {}

  async init(user: User) {
    const [unreadCount] = await Promise.all([this.conversationService.countUnreadConversations()])
    const permissions = await this.permissionService.getPermissionByUserId(user.id)

    return {
      user,
      permissions,
      badges: {
        conversationsUnreadCount: unreadCount,
      },
    }
  }

  // Liveness: process còn chạy hay không (dùng cho restart tự động).
  live() {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }

  // Readiness: instance đã sẵn sàng nhận traffic hay chưa.
  async ready() {
    const checks = {
      database: false,
      redis: false,
    }

    try {
      // Query tối thiểu để xác nhận kết nối DB còn hoạt động.
      await this.prismaService.client.$queryRaw`SELECT 1`
      checks.database = true
    } catch (error) {
      this.logger.error(`Readiness DB check failed: ${(error as Error).message}`)
    }

    try {
      // Ping Redis để xác nhận cache/queue/socket adapter còn usable.
      checks.redis = await this.redisService.ping()
    } catch (error) {
      this.logger.error(`Readiness Redis check failed: ${(error as Error).message}`)
    }

    return {
      status: checks.database && checks.redis ? "ready" : "not_ready",
      checks,
      timestamp: new Date().toISOString(),
    }
  }
}
