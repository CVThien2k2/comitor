import { Global, Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { ConfigService } from "@nestjs/config"
import { QUEUE_NAMES } from "./queue.constants"
import { MessageProcessor } from "./message.processor"
import { MessageHandler } from "./message.handler"
import { QueueService } from "./queue.service"
import { AccountCustomerModule } from "../core/account-customer/account-customer.module"
import { MessageModule } from "../core/message/message.module"

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
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    AccountCustomerModule,
    MessageModule,
  ],
  providers: [MessageProcessor, MessageHandler, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
