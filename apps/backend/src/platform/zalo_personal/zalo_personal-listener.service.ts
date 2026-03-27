import { Injectable, Logger } from "@nestjs/common"
import { inspect } from "node:util"
import { QueueService } from "../../queue/queue.service"
import { ZaloPersonalMessageListener } from "../../utils/types"
import { mapZaloPersonal } from "./utils/helper"
import { stringifyUnknownError } from "./utils/error"

export type ZaloPersonalListenerParams = {
  sessionKey: string
  api: any
  accountId: string | null
  displayName: string | null
  source: "qr_login" | "restore"
}

@Injectable()
export class ZaloPersonalListenerService {
  private readonly logger = new Logger(ZaloPersonalListenerService.name)

  constructor(private readonly queueService: QueueService) {}

  start(params: ZaloPersonalListenerParams) {
    params.api.listener.on("connected", () => {
      this.logger.log(
        `Zalo Personal listener da ket noi (source=${params.source}, sessionKey=${params.sessionKey}, accountId=${params.accountId ?? "unknown"})`
      )
    })

    params.api.listener.on("message", async (message: ZaloPersonalMessageListener) => {
      const mapped = mapZaloPersonal(message)
      const normalizedMessage = {
        ...mapped,
        messageId: String(mapped.messageId),
      }
      try {
        await this.queueService.addIncomingMessage(normalizedMessage)
        this.logger.log(`Da them tin nhan Zalo Personal vao hang doi: ${mapped.messageId}`)
      } catch (error) {
        this.logger.error(
          `Them tin nhan Zalo Personal vao hang doi that bai (messageId=${mapped.messageId}): ${stringifyUnknownError(error)}`,
          error instanceof Error ? error.stack : undefined
        )
      }
    })

    params.api.listener.on("error", (error: unknown) => {
      this.logger.error(
        `Zalo Personal listener error (sessionKey=${params.sessionKey}, accountId=${params.accountId ?? "unknown"}): ${stringifyUnknownError(error)}`,
        error instanceof Error ? error.stack : undefined
      )
    })

    params.api.listener.on("closed", (code: number, reason: string) => {
      this.logger.warn(
        `Zalo Personal listener closed (sessionKey=${params.sessionKey}, accountId=${params.accountId ?? "unknown"}, code=${code}, reason=${reason})`
      )
    })

    params.api.listener.on("disconnected", (code: number, reason: string) => {
      this.logger.warn(
        `Zalo Personal listener disconnected (sessionKey=${params.sessionKey}, accountId=${params.accountId ?? "unknown"}, code=${code}, reason=${reason})`
      )
    })

    params.api.listener.start({ retryOnClose: true })

    this.logger.log(
      `Da khoi dong Zalo Personal listener (source=${params.source}, sessionKey=${params.sessionKey}, accountId=${params.accountId ?? "unknown"}, displayName=${params.displayName ?? "unknown"})`
    )
  }
}
