import { Module } from "@nestjs/common"
import { AccountCustomerModule } from "src/core/account-customer/account-customer.module"
import { ConversationModule } from "src/core/conversation/conversation.module"
import { WebhookController } from "./webhook.controller"
import { WebhookService } from "./webhook.service"
import { ApiModule } from "src/api/api.module"

@Module({
  imports: [ApiModule, AccountCustomerModule, ConversationModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
