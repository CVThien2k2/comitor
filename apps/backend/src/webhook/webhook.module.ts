import { Module } from "@nestjs/common"
import { WebhookController } from "./webhook.controller"
import { WebhookService } from "./webhook.service"
import { ApiModule } from "src/api/api.module"

@Module({
  imports: [ApiModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
