import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ResendModule } from "nestjs-resend"
import { DatabaseModule } from "./database/database.module"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./core/users/users.module"
import { RoleModule } from "./core/role/role.module"
import { PermissionModule } from "./core/permission/permission.module"
import { ConversationModule } from "./core/conversation/conversation.module"
import { MessageModule } from "./core/message/message.module"
import { GoldenProfileModule } from "./core/golden-profile/golden-profile.module"
import { AccountCustomerModule } from "./core/account-customer/account-customer.module"
import { LinkAccountModule } from "./core/link-account/link-account.module"
import { UploadModule } from "./upload/upload.module"
import { EmailModule } from "./email/email.module"
import { SocketModule } from "./websocket/socket.module"
import { EventsModule } from "./events/events.module"
import { RedisModule } from "./redis/redis.module"
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard"
import { PermissionsGuard } from "./common/guards/permissions.guard"
import { QueueModule } from "./queue/queue.module"
import { PlatformModule } from "./platform/platform.module"
import { SuggestedMessageModule } from "./core/suggested-message/suggested-message.module"
import { AgentLevelModule } from "./core/agent-level/agent-level.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    ResendModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>("RESEND_API_KEY", ""),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    RoleModule,
    PermissionModule,
    ConversationModule,
    MessageModule,
    GoldenProfileModule,
    AccountCustomerModule,
    LinkAccountModule,
    UploadModule,
    EmailModule,
    SocketModule,
    EventsModule,
    PlatformModule,
    QueueModule,
    SuggestedMessageModule,
    AgentLevelModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
