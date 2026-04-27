import { Injectable, Logger } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import type { MessagePlatform } from "../utils/types"
import { QUEUE_NAMES } from "./queue.constants"

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)

  constructor(
    @InjectQueue(QUEUE_NAMES.INCOMING_MESSAGE)
    private readonly incomingMessageQueue: Queue
  ) {}

  private createMessageJobId(message: MessagePlatform) {
    const normalizedMessageId = String(message.messageId).trim().replaceAll(":", "-")

    if (!normalizedMessageId) {
      return undefined
    }

    return `${message.eventName}-${message.provider}-${normalizedMessageId}`
  }

  async addIncomingMessage(message: MessagePlatform) {
    try {
      return this.incomingMessageQueue.add(message.provider, message, {
        jobId: this.createMessageJobId(message),
      })
    } catch (error) {
      this.logger.error(`Không thể thêm tin nhắn vào queue: ${JSON.stringify(error)}`)
      throw error
    }
  }
}
