import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { EventMessage, type Message } from "src/utils/types"
import { QUEUE_NAMES } from "./queue.constants"
import { IncomingMessageHandler } from "./incoming-message.handler"

@Processor(QUEUE_NAMES.INCOMING_MESSAGE)
export class IncomingMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(IncomingMessageProcessor.name)

  constructor(private readonly incomingMessageHandler: IncomingMessageHandler) {
    super()
  }

  async process(job: Job<Message>) {
    const { data } = job

    if (data.eventName !== EventMessage.INBOUND) {
      this.logger.debug(`Bỏ qua tin nhắn outbound: ${data.messageId}`)
      return
    }

    this.logger.log(`[${data.provider}] Xử lý tin nhắn inbound: ${data.messageId}`)

    await this.incomingMessageHandler.handle(data)
  }
}
