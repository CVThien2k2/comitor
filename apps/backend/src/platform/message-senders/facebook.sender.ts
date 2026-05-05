import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"

@Injectable()
export class FacebookSender implements MessageSender {
  private readonly logger = new Logger(FacebookSender.name)

  private normalizeText(raw: unknown): string {
    const content = Array.isArray(raw)
      ? ((raw[0] ?? {}) as Record<string, unknown>)
      : ((raw ?? {}) as Record<string, unknown>)
    if (!content || typeof content !== "object") return ""
    return typeof content.text === "string" ? content.text.trim() : ""
  }

  async send(input: MessageSenderInput) {
    if (input.message.type !== "text") {
      const error = `Facebook sender chỉ hỗ trợ text, received=${input.message.type}`
      this.logger.error(error)
      throw new Error(error)
    }

    const pageAccessToken = (input.linkedAccount.credentials as any)?.pageAccessToken as string | undefined
    const pageId = input.linkedAccount.accountId
    const recipientId = input.conversationExternalId
    const text = this.normalizeText(input.message.content)

    if (!pageAccessToken) throw new Error("Thiếu pageAccessToken Facebook")
    if (!pageId) throw new Error("Thiếu pageId Facebook")
    if (!recipientId) throw new Error("Thiếu recipientId Facebook")
    if (!text) throw new Error("Nội dung text Facebook trống")

    const response = await fetch(`https://graph.facebook.com/v25.0/${pageId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text },
        access_token: pageAccessToken,
      }),
    }).then((res) => res.json())

    if ((response as any)?.error) {
      const error = `[Facebook] gửi text thất bại: ${JSON.stringify(response)}`
      this.logger.error(error)
      throw new Error(error)
    }

    return { externalMessageId: (response as any)?.message_id ? String((response as any).message_id) : undefined }
  }
}
