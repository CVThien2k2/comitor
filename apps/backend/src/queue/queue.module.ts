import { Global, Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { ConfigService } from "@nestjs/config"
import { QUEUE_NAMES } from "./queue.constants"
import { MessageProcessor } from "./message.processor"
import { QueueService } from "./queue.service"
import { AccountCustomerModule } from "../core/account-customer/account-customer.module"
import { ConversationModule } from "../core/conversation/conversation.module"
import { LinkAccountModule } from "../core/link-account/link-account.module"
import { MessageModule } from "../core/message/message.module"

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>("REDIS_URL", "redis://localhost:6379"),
          db: 1,
          retryStrategy(times: number) {
            if (times > 5) return 10_000
            return Math.min(times * 1000, 5000) // delay tăng dần, tối đa 5s
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.INCOMING_MESSAGE,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    AccountCustomerModule,
    ConversationModule,
    LinkAccountModule,
    MessageModule,
  ],
  providers: [MessageProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
