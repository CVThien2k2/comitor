import { Injectable } from "@nestjs/common"

import { Attachment, EventMessage, Message, MessageType } from "src/utils/types"

const toSafeString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value)
  }
  return undefined
}

const toNumber = (value: unknown): number | undefined => {
  const normalizedValue = Number(value)
  return Number.isFinite(normalizedValue) ? normalizedValue : undefined
}

const inferAttachmentType = (...values: Array<unknown>): MessageType => {
  const source = values
    .map((value) => toSafeString(value) ?? "")
    .join(" ")
    .toLowerCase()

  if (source.includes("sticker") || source.includes("emoji") || source.includes(".webp")) {
    return "sticker"
  }

  if (source.includes("image") || /\.(jpg|jpeg|png|gif|bmp|webp)(\?|$)/.test(source)) {
    return "image"
  }

  if (source.includes("video") || /\.(mp4|mov|avi|mkv|webm)(\?|$)/.test(source)) {
    return "video"
  }

  if (source.includes("audio") || source.includes("voice") || /\.(mp3|wav|ogg|m4a|aac)(\?|$)/.test(source)) {
    return "audio"
  }

  if (
    source.includes("file") ||
    source.includes("document") ||
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)(\?|$)/.test(source)
  ) {
    return "file"
  }

  return "unknown"
}

const dedupeAttachments = (attachments: Attachment[]) =>
  attachments.filter((attachment, index, values) => {
    const key = `${attachment.type}|${attachment.url ?? ""}|${attachment.name ?? ""}|${attachment.thumbnail ?? ""}`
    return (
      values.findIndex((item) => `${item.type}|${item.url ?? ""}|${item.name ?? ""}|${item.thumbnail ?? ""}` === key) ===
      index
    )
  })

const normalizeZaloOAAttachment = (attachment: any): Attachment | null => {
  const payload = attachment?.payload ?? {}
  const url = toSafeString(payload?.url)
  const thumbnail = toSafeString(payload?.thumbnail)
  const name = toSafeString(payload?.name) ?? toSafeString(payload?.id)
  const size = toNumber(payload?.size)
  const mimeType = toSafeString(payload?.type)
  const type = inferAttachmentType(attachment?.type, mimeType, url, name)

  if (!url && !thumbnail && !name && !mimeType && size == null) {
    return null
  }

  return {
    type,
    url,
    thumbnail,
    name,
    size,
    mimeType,
  }
}

const normalizeMetaAttachment = (attachment: any): Attachment | null => {
  const payload = attachment?.payload ?? {}
  const url =
    toSafeString(payload?.url) ??
    toSafeString(payload?.attachment_url) ??
    toSafeString(payload?.file_url) ??
    toSafeString(payload?.src)
  const thumbnail = toSafeString(payload?.thumbnail_url) ?? toSafeString(payload?.thumbnail)
  const name = toSafeString(payload?.name) ?? toSafeString(payload?.title) ?? toSafeString(payload?.filename)
  const size = toNumber(payload?.size)
  const mimeType = toSafeString(payload?.mime_type) ?? toSafeString(payload?.content_type)
  const type = inferAttachmentType(attachment?.type, mimeType, url, name)

  if (!url && !thumbnail && !name && !mimeType && size == null) {
    return null
  }

  return {
    type,
    url,
    thumbnail,
    name,
    size,
    mimeType,
  }
}

@Injectable()
export class WebhookService {
  mapZaloWebhook(payload: any): Message {
    const msg = payload.message

    const isOutbound = payload.event_name.startsWith("oa_send")
    const attachments = dedupeAttachments((msg.attachments ?? []).map(normalizeZaloOAAttachment).filter(Boolean))

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
      type: msg.text ? "text" : (attachments[0]?.type ?? "unknown"),
      text: msg.text,
      attachments: attachments.length ? attachments : undefined,
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
    const attachments = dedupeAttachments((msg.message.attachments ?? []).map(normalizeMetaAttachment).filter(Boolean))

    return {
      provider: "facebook",
      eventName: isEcho ? EventMessage.OUTBOUND : EventMessage.INBOUND,
      messageId: msg.message.mid,
      conversationId: msg.sender.id,
      senderId: msg.sender.id,
      recipientId: msg.recipient.id,
      timestamp: msg.timestamp,
      type: msg.message.text ? "text" : (attachments[0]?.type ?? "unknown"),
      text: msg.message.text,
      attachments: attachments.length ? attachments : undefined,
      // raw: payload
    }
  }
}
