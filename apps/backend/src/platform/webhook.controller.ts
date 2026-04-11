import { Body, Controller, Get, HttpCode, Logger, Post, Query, Res } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger"
import { EVENTS } from "@workspace/shared"
import { Response } from "express"
import { AccountCustomerService } from "src/core/account-customer/account-customer.service"
import { ConversationService } from "src/core/conversation/conversation.service"
import { PrismaService } from "src/database/prisma.service"
import {
  MetaMessageWebhook,
  ZaloOAWebhookPayload,
  ZaloOaWebhookUserClickChatnowPayload,
  ZaloOaWebhookUserClickFollowPayload,
} from "src/utils/types/webhook"
import { SocketGateway } from "src/websocket/socket.gateway"
import { Public } from "../common/decorators/public.decorator"
import { WebhookService } from "./webhook.service"
import { QueueService } from "src/queue/queue.service"
import { ZaloOAWebhookDto } from "./dto/zalo-oa-webhook.dto"

@ApiTags("Webhook")
@Public()
@Controller("webhook")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
    private readonly accountCustomerService: AccountCustomerService,
    private readonly conversationService: ConversationService,
    private readonly socketGateway: SocketGateway
  ) {}

  private getZaloOAEngagementParticipantIds(
    payload: ZaloOaWebhookUserClickFollowPayload | ZaloOaWebhookUserClickChatnowPayload
  ) {
    if (payload.event_name === "follow") {
      return {
        senderId: payload.follower.id,
        recipientId: payload.oa_id,
      }
    }

    return {
      senderId: payload.user_id,
      recipientId: payload.oa_id,
    }
  }

  private resolveWebhookTimestamp(value: string) {
    const numericTimestamp = Number(value)
    if (Number.isFinite(numericTimestamp)) {
      return new Date(numericTimestamp)
    }

    const parsedDate = new Date(value)
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
  }

  private async handleZaloOAEngagementWebhook(
    payload: ZaloOaWebhookUserClickFollowPayload | ZaloOaWebhookUserClickChatnowPayload
  ) {
    const { senderId, recipientId } = this.getZaloOAEngagementParticipantIds(payload)

    const linkedAccount = await this.prisma.client.linkAccount.findFirst({
      where: {
        provider: "zalo_oa",
        accountId: recipientId,
      },
    })

    if (!linkedAccount) {
      this.logger.warn(
        `Không tìm thấy linked account Zalo OA cho event_name=${payload.event_name} sender_id=${senderId} recipient_id=${recipientId}`
      )
      return
    }

    const eventTimestamp = this.resolveWebhookTimestamp(payload.timestamp)

    const { conversation, isNew } = await this.prisma.client.$transaction(async (tx) => {
      const accountCustomer = await this.accountCustomerService.getOrCreateAndSyncProfile(
        {
          accountId: senderId,
          linkedAccount,
        },
        tx
      )

      const result = await this.conversationService.getOrCreate(
        {
          externalId: senderId,
          linkedAccountId: linkedAccount.id,
          accountCustomerId: accountCustomer.id,
          isGroupMessage: false,
        },
        tx
      )

      await tx.conversation.update({
        where: { id: result.conversation.id },
        data: { lastActivityAt: eventTimestamp },
      })

      return result
    })

    if (isNew) {
      const fullConversation = await this.conversationService.findById(conversation.id)
      this.socketGateway.broadcast(EVENTS.CONVERSATION_CREATED, fullConversation)
    }
  }

  private async processZaloOAWebhook(payload: ZaloOAWebhookPayload) {
    let senderId: string | undefined
    let recipientId: string | undefined

    try {
      const isFollowEvent = payload.event_name === "follow"
      const isChatNowEvent = payload.event_name === "user_click_chatnow"
      const isMessageEvent = /^(oa_send|user_send)/.test(payload.event_name)

      if (isFollowEvent || isChatNowEvent) {
        const participantIds = this.getZaloOAEngagementParticipantIds(payload)
        senderId = participantIds.senderId
        recipientId = participantIds.recipientId
      } else if ("sender" in payload) {
        senderId = payload.sender.id
        recipientId = payload.recipient.id
      }

      if (!isMessageEvent && !isChatNowEvent && !isFollowEvent) {
        this.logger.warn(
          `Skipped unsupported Zalo OA webhook event_name=${payload.event_name ?? "unknown"} sender_id=${senderId ?? "unknown"} recipient_id=${recipientId ?? "unknown"}`
        )
        return
      }

      if (isFollowEvent || isChatNowEvent) {
        await this.handleZaloOAEngagementWebhook(payload)
        return
      }

      const message = this.webhookService.mapZaloWebhook(payload)
      const allowedParticipantId = ["2994357122857097520", "6503616889426404863"]

      if (!message) {
        this.logger.warn(
          `Skipped invalid Zalo OA message payload event_name=${payload.event_name ?? "unknown"} sender_id=${senderId ?? "unknown"} recipient_id=${recipientId ?? "unknown"}`
        )
        return
      }

      // if (!allowedParticipantId.includes(senderId) && !allowedParticipantId.includes(recipientId)) {
      //   this.logger.warn(
      //     `Ignored Zalo OA webhook with sender_id=${senderId ?? "unknown"} recipient_id=${recipientId ?? "unknown"}`
      //   )
      //   return
      // }

      await this.queueService.addIncomingMessage(message)
    } catch (error) {
      this.logger.error(
        `Failed to process Zalo OA webhook event_name=${payload.event_name ?? "unknown"} sender_id=${senderId ?? "unknown"} recipient_id=${recipientId ?? "unknown"}`,
        error instanceof Error ? error.stack : undefined
      )
    }
  }

  @Public()
  @Post("zalo-oa")
  @HttpCode(200)
  @ApiOperation({ summary: "Nhận webhook từ Zalo OA" })
  @ApiBody({ type: ZaloOAWebhookDto })
  handleZaloOAWebhook(@Body() payload: ZaloOAWebhookPayload, @Res() res: Response) {
    res.status(200).send("OK")
    void this.processZaloOAWebhook(payload)
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
    const message = this.webhookService.mapMetaWebhook(body)
    if (!message) return "EVENT_RECEIVED"

    await this.queueService.addIncomingMessage(message)
    return "EVENT_RECEIVED"
  }
}
