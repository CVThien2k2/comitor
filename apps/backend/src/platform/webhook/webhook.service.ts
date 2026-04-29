import { Injectable, Logger } from "@nestjs/common"

import { QueueService } from "src/queue/queue.service"
import { mapMetasWebhook, mapZaloOaWebhook } from "./helper"

@Injectable()
export class WebhookService {
  private readonly logger = new Logger("WebhookService")

  constructor(private readonly queueService: QueueService) {}

  async handleZaloOAWebhook(payload: any) {
    try {
      const message = mapZaloOaWebhook(payload)
      const id = "2994357122857097520"
      if (message?.linkedAccountId !== id && message?.accountCustomerId !== id) return
      if (!message) throw new Error()
      await this.queueService.addIncomingMessage(message)
    } catch {
      this.logger.warn(`[ZaloOA] Tin nhắn Zalo OA chưa xử lý được: ${JSON.stringify(payload)}`)
    }
  }

  async mapMetaWebhook(payload: any) {
    try {
      const messages = mapMetasWebhook(payload)
      if (!messages) throw new Error()
      for (const message of messages) {
        await this.queueService.addIncomingMessage(message)
      }
    } catch {
      this.logger.warn(`[Meta] Tin nhắn Meta chưa xử lý được: ${JSON.stringify(payload)}`)
    }
  }
}
