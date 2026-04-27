import { Body, Controller, Get, HttpCode, Logger, Post, Query, Res } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Response } from "express"
import { Public } from "../../common/decorators/public.decorator"
import { WebhookService } from "./webhook.service"

@ApiTags("Webhook")
@Public()
@Controller("webhook")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Post("zalo-oa")
  @HttpCode(200)
  @ApiOperation({ summary: "Nhận webhook từ Zalo OA" })
  handleZaloOAWebhook(@Body() payload: any, @Res() res: Response) {
    res.status(200).send("OK")
    return this.webhookService.handleZaloOAWebhook(payload)
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
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    await this.webhookService.mapMetaWebhook(body)
    return res.status(200).send("EVENT_RECEIVED")
  }
}
