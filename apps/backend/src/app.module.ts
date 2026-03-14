import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ResendModule } from "nestjs-resend"
import { DatabaseModule } from "./database/database.module"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./core/users/users.module"
import { WebhookModule } from "./webhook/webhook.module"
import { UploadModule } from "./upload/upload.module"
import { EmailModule } from "./email/email.module"
import { SocketModule } from "./websocket/socket.module"
import { EventsModule } from "./events/events.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    ResendModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>("RESEND_API_KEY", ""),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    WebhookModule,
    UploadModule,
    EmailModule,
    SocketModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
