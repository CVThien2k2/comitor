import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"
import { ZaloInstanceRegistry } from "../zalo/zalo-instance.registry"

type OutboundContent = {
  text?: string
}

@Injectable()
export class ZaloPersonalSender implements MessageSender {
  private readonly logger = new Logger(ZaloPersonalSender.name)

  constructor(private readonly zaloInstanceRegistry: ZaloInstanceRegistry) { }

  private normalizeContent(raw: unknown): OutboundContent {
    const content = Array.isArray(raw)
      ? ((raw[0] ?? {}) as Record<string, unknown>)
      : ((raw ?? {}) as Record<string, unknown>)
    if (!content || typeof content !== "object") return {}
    return {
      text: typeof content.text === "string" ? content.text : undefined,
    }
  }

  async send(input: MessageSenderInput) {
    if (input.message.type !== "text") {
      const error = `ZaloPersonal chỉ hỗ trợ text, received=${input.message.type}`
      this.logger.error(error)
      throw new Error(error)
    }

    const linkedAccountExternalId = input.linkedAccount.accountId
    if (!linkedAccountExternalId) throw new Error("Thiếu accountId của linked account")

    const api = this.zaloInstanceRegistry.get(linkedAccountExternalId)
    if (!api) throw new Error("Không tìm thấy phiên Zalo personal trong registry")

    const threadId = input.conversationExternalId
    if (!threadId) throw new Error("Thiếu externalId của conversation để gửi tin")

    const { ThreadType } = (await import("zca-js")) as any
    const threadType = input.conversationType === "group" ? ThreadType.Group : ThreadType.User

    const content = this.normalizeContent(input.message.content)
    const text = content.text?.trim() ?? ""
    if (!text) throw new Error("Nội dung text gửi Zalo personal trống")

    const response = await api.sendMessage(text, threadId, threadType)
    const externalMessageId =
      response?.message?.msgId ?? response?.messageId ?? response?.msgId ?? response?.data?.msgId

    return { externalMessageId: externalMessageId ? String(externalMessageId) : undefined }
  }
}
