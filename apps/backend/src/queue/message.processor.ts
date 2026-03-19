import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { EventMessage, type Message } from "src/utils/types"
import { QUEUE_NAMES } from "./queue.constants"
import { MessageHandler } from "./message.handler"

@Processor(QUEUE_NAMES.INCOMING_MESSAGE)
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name)

  constructor(private readonly messageHandler: MessageHandler) {
    super()
  }

  async process(job: Job<Message>) {
    const { data } = job
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1)

    try {
      switch (data.eventName) {
        case EventMessage.INBOUND:
          await this.messageHandler.handleInbound(data)
          break
        case EventMessage.OUTBOUND:
          await this.messageHandler.handleOutbound(data)
          break
        default:
          this.logger.debug(`Bỏ qua tin nhắn: ${data.messageId}`)
          break
      }
    } catch (error) {
      if (isLastAttempt) {
        this.logger.error(`Job ${job.id} thất bại sau ${job.attemptsMade + 1} lần thử: ${(error as Error).message}`)
      }
      throw error
    }
  }
}
