import { Injectable } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import type { Message } from "src/utils/types"
import { QUEUE_NAMES } from "./queue.constants"

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.INCOMING_MESSAGE)
    private readonly incomingMessageQueue: Queue
  ) {}

  async addIncomingMessage(message: Message) {
    return this.incomingMessageQueue.add(message.provider, message, {
      jobId: message.messageId,
    })
  }
}
