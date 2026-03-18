import { Injectable } from "@nestjs/common"

import { EventMessage, Message } from "src/utils/types"

@Injectable()
export class WebhookService {
  mapZaloWebhook(payload: any): Message {
    const msg = payload.message

    const isOutbound = payload.event_name.startsWith("oa_send")

    return {
      provider: "zalo_oa",
      eventName: isOutbound
        ? (EventMessage.OUTBOUND as unknown as EventMessage)
        : (EventMessage.INBOUND as unknown as EventMessage),
      messageId: msg.msg_id,
      conversationId: payload.sender.id,
      senderId: payload.sender.id,
      recipientId: payload.recipient.id,
      timestamp: Number(payload.timestamp),
      type: msg.text ? "text" : (msg.attachments?.[0]?.type ?? "unknown"),
      text: msg.text,
      attachments: msg.attachments?.map((a: any) => ({
        type: a.type,
        url: a.payload.url,
        thumbnail: a.payload.thumbnail,
        name: a.payload.name,
        size: a.payload.size ? Number(a.payload.size) : undefined,
      })),
      // raw: payload
    }
  }

  mapMetaWebhook(payload: any): Message | null {
    const msg = payload?.entry?.[0]?.messaging?.[0]

    if (!msg?.message?.mid) {
      return null
    }

    const hasIsEcho = Object.prototype.hasOwnProperty.call(msg.message, "is_echo")
    const isEcho = hasIsEcho && msg.message.is_echo === true

    return {
      provider: "facebook",
      eventName: isEcho ? EventMessage.OUTBOUND : EventMessage.INBOUND,
      messageId: msg.message.mid,
      conversationId: msg.sender.id,
      senderId: msg.sender.id,
      recipientId: msg.recipient.id,
      timestamp: msg.timestamp,
      type: msg.message.text ? "text" : (msg.message.attachments?.[0]?.type ?? "unknown"),
      text: msg.message.text,
      attachments: msg.message.attachments?.map((a: any) => ({
        type: a.type,
        url: a.payload.url,
      })),
      // raw: payload
    }
  }
}
