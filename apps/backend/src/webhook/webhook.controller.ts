import { Body, Controller, Get, Logger, Post, Query, Res } from "@nestjs/common"
import { Response } from "express"
import { WebhookService } from "./webhook.service"
import { ConfigService } from "@nestjs/config"
import { MetaMessageWebhook, ZaloOAMessageWebhook } from "src/utils/types/webhook"
import { Public } from "../common/decorators/public.decorator"

@Public()
@Controller("webhook")
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService
  ) {}

  @Post("zalo-oa")
  async handleZaloOAWebhook(@Body() payload: ZaloOAMessageWebhook, @Res() res: Response) {
    res.status(200).send("OK")

    if (
      payload?.sender?.id !== "2994357122857097520" &&
      payload?.recipient?.id !== "2994357122857097520" &&
      payload.sender.id !== "6503616889426404863" &&
      payload.recipient.id !== "6503616889426404863"
    ) {
      return
    }

    console.log("Received Zalo OA webhook 123:", this.webhookService.mapZaloWebhook(payload))
  }

  @Get("meta")
  handleMetaWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response
  ) {
    if (mode === "subscribe" && token === this.configService.get("META_VERIFY_TOKEN")) {
      res.status(200).send(challenge)
      Logger.log("✅ Webhook verified successfully!")
      return
    } else {
      console.log("❌ Verification failed!")
      res.status(403).send("Forbidden")
    }
  }

  @Post("meta")
  handleWebhook(@Body() body: MetaMessageWebhook, @Res() res: Response) {
    res.status(200).send("EVENT_RECEIVED")
    console.log("Received Meta webhook:", this.webhookService.mapMetaWebhook(body))
  }
}
