import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class ZaloOaSender implements MessageSender {
  private readonly logger = new Logger(ZaloOaSender.name)

  constructor() {}

  private normalizeText(raw: unknown): string {
    const content = Array.isArray(raw)
      ? ((raw[0] ?? {}) as Record<string, unknown>)
      : ((raw ?? {}) as Record<string, unknown>)
    if (!content || typeof content !== "object") return ""
    return typeof content.text === "string" ? content.text.trim() : ""
  }

  async send(input: MessageSenderInput) {
    if (input.message.type !== "text") {
      const error = `Zalo OA sender chỉ hỗ trợ text, received=${input.message.type}`
      this.logger.error(error)
      throw new Error(error)
    }

    const accessToken = (input.linkedAccount.credentials as any)?.access_token as string | undefined
    const recipientId = input.conversationExternalId
    const text = this.normalizeText(input.message.content)

    if (!accessToken) throw new Error("Thiếu access_token Zalo OA")
    if (!recipientId) throw new Error("Thiếu recipientId Zalo OA")
    if (!text) throw new Error("Nội dung text Zalo OA trống")

    const body = JSON.stringify({
      recipient: { user_id: recipientId },
      message: { text },
    })
    const response = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body,
    }).then((res) => res.json())

    if ((response as any)?.error) {
      const error = `[Zalo OA] gửi text thất bại: ${JSON.stringify(response)}`
      this.logger.error(error)
      throw new Error(error)
    }

    return { externalMessageId: (response as any)?.data?.message_id ? String((response as any).data.message_id) : undefined }
  }
}
