import { Global, Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { ConfigService } from "@nestjs/config"
import { QUEUE_NAMES } from "./queue.constants"
import { IncomingMessageProcessor } from "./incoming-message.processor"
import { IncomingMessageHandler } from "./incoming-message.handler"
import { QueueService } from "./queue.service"

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>("REDIS_URL", "redis://localhost:6379"),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.INCOMING_MESSAGE,
    }),
  ],
  providers: [IncomingMessageProcessor, IncomingMessageHandler, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
