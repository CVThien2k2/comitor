import { Body, Controller, Get, HttpCode, Logger, Post, Query, Res } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Response } from "express"
import { QueueService } from "src/queue/queue.service"
import { MetaMessageWebhook, ZaloOAWebhookPayload } from "src/utils/types/webhook"
import { Public } from "../common/decorators/public.decorator"
import { WebhookService } from "./webhook.service"

@ApiTags("Webhook")
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
  @HttpCode(200)
  @ApiOperation({ summary: "Nhận webhook từ Zalo OA" })
  async handleZaloOAWebhook(@Body() payload: ZaloOAWebhookPayload, @Res() res: Response) {
    res.status(200).send("OK")
    const message = this.webhookService.mapZaloWebhook(payload)
    if (!message) return
    await this.queueService.addIncomingMessage(message)
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
  @HttpCode(200)
  @ApiOperation({ summary: "Nhận webhook từ Meta (Facebook)" })
  async handleWebhook(@Body() body: MetaMessageWebhook) {
    console.log(JSON.stringify(body, null, 2))
    const message = this.webhookService.mapMetaWebhook(body)
    if (!message) return "EVENT_RECEIVED"

    await this.queueService.addIncomingMessage(message)
    return "EVENT_RECEIVED"
  }
}
