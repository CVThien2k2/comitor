import { Body, Controller, Get, Logger, Post, Query, Res } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Response } from "express"
import { MetaMessageWebhook, ZaloOAMessageWebhook } from "src/utils/types/webhook"
import { Public } from "../common/decorators/public.decorator"
import { WebhookService } from "./webhook.service"
import { QueueService } from "src/queue/queue.service"

@Public()
@Controller("webhook")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService
  ) {}

  @Public()
  @Post("zalo-oa")
  async handleZaloOAWebhook(@Body() payload: ZaloOAMessageWebhook, @Res() res: Response) {
    res.status(200).send("OK")

    const message = this.webhookService.mapZaloWebhook(payload)
    await this.queueService.addIncomingMessage(message)
    this.logger.log(`Đã thêm tin nhắn Zalo OA vào hàng đợi: ${message.messageId}`)
  }

  @Public()
  @Get("meta")
  handleMetaWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response
  ) {
    if (mode === "subscribe" && token === this.configService.get("META_VERIFY_TOKEN")) {
      res.status(200).send(challenge)
      this.logger.log("Webhook Meta verified successfully")
      return
    }

    this.logger.warn("Webhook Meta verification failed")
    res.status(403).send("Forbidden")
  }

  @Public()
  @Post("meta")
  async handleWebhook(@Body() body: MetaMessageWebhook, @Res() res: Response) {
    res.status(200).send("EVENT_RECEIVED")

    const message = this.webhookService.mapMetaWebhook(body)
    if (!message) return

    await this.queueService.addIncomingMessage(message)
    this.logger.log(`Đã thêm tin nhắn Meta vào hàng đợi: ${message.messageId}`)
  }
}
