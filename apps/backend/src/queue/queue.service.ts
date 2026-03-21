import { Injectable } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import type { Message } from "../utils/types"
import { QUEUE_NAMES } from "./queue.constants"

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.INCOMING_MESSAGE)
    private readonly incomingMessageQueue: Queue
  ) {}

  private createMessageJobId(message: Message, type: "incoming" | "outgoing") {
    const normalizedMessageId = String(message.messageId).trim().replaceAll(":", "-")

    if (!normalizedMessageId) {
      return undefined
    }

    return `${type}-${message.provider}-${normalizedMessageId}`
  }

  async addIncomingMessage(message: Message) {
    return this.incomingMessageQueue.add(message.provider, message, {
      jobId: this.createMessageJobId(message, "incoming"),
    })
  }
}
