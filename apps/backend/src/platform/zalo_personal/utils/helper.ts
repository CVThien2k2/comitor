// import { Attachment, EventMessage, Message, MessageType, ZaloPersonalMessageListener } from "../../../utils/types"

// export const mapZaloPersonal = (response: ZaloPersonalMessageListener): Message => {
//   const raw = response ?? {}
//   const data = raw?.data ?? raw
//   const toSafeString = (value: unknown): string | undefined => {
//     if (typeof value === "string") return value
//     if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
//       return String(value)
//     }
//     return undefined
//   }

//   const conversationId =
//     toSafeString(raw?.threadId) ??
//     toSafeString(raw?.thread_id) ??
//     toSafeString(data?.threadId) ??
//     toSafeString(data?.thread_id) ??
//     toSafeString(data?.idTo) ??
//     toSafeString(data?.uidFrom) ??
//     ""

//   const messageId =
//     toSafeString(data?.msgId) ??
//     toSafeString(data?.messageId) ??
//     toSafeString(data?.cliMsgId) ??
//     toSafeString(data?.realMsgId) ??
//     toSafeString(raw?.msgId) ??
//     toSafeString(raw?.messageId) ??
//     ""

//   const senderId =
//     toSafeString(data?.uidFrom) ??
//     toSafeString(data?.fromId) ??
//     toSafeString(data?.senderId) ??
//     toSafeString(raw?.uidFrom) ??
//     toSafeString(raw?.senderId) ??
//     ""

//   const recipientId =
//     toSafeString(data?.idTo) ??
//     toSafeString(data?.toId) ??
//     toSafeString(data?.recipientId) ??
//     toSafeString(raw?.idTo) ??
//     toSafeString(raw?.recipientId) ??
//     ""

//   const timestamp = Number(data?.ts ?? data?.timestamp ?? raw?.ts ?? raw?.timestamp ?? Date.now()) || Date.now()

//   const content: any = data?.content ?? raw?.content

//   const text =
//     typeof content === "string"
//       ? content
//       : typeof data?.msg === "string"
//         ? data.msg
//         : typeof data?.text === "string"
//           ? data.text
//           : typeof raw?.text === "string"
//             ? raw.text
//             : undefined

//   const attachments: Attachment[] = []

//   const toNumber = (value: unknown): number | undefined => {
//     const n = Number(value)
//     return Number.isFinite(n) ? n : undefined
//   }

//   const safeJsonParse = (value: unknown): any => {
//     if (typeof value !== "string") return undefined
//     try {
//       return JSON.parse(value)
//     } catch {
//       return undefined
//     }
//   }

//   const inferTypeFromUrlOrName = (url?: string, name?: string, explicitType?: string): MessageType => {
//     const source = `${explicitType ?? ""} ${url ?? ""} ${name ?? ""}`.toLowerCase()

//     if (source.includes("sticker") || source.includes("emoji") || source.includes(".webp")) {
//       return "sticker"
//     }
//     if (source.includes("image") || /\.(jpg|jpeg|png|gif|bmp|webp)(\?|$)/.test(source)) {
//       return "image"
//     }
//     if (source.includes("video") || /\.(mp4|mov|avi|mkv|webm)(\?|$)/.test(source)) {
//       return "video"
//     }
//     if (source.includes("audio") || source.includes("voice") || /\.(mp3|wav|ogg|m4a|aac)(\?|$)/.test(source)) {
//       return "audio"
//     }
//     if (
//       source.includes("file") ||
//       source.includes("document") ||
//       /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)(\?|$)/.test(source)
//     ) {
//       return "file"
//     }

//     return "unknown"
//   }

//   const normalizeAttachment = (obj: any): Attachment | null => {
//     if (!obj || typeof obj !== "object") return null

//     const params = safeJsonParse(obj?.params)

//     const url = obj?.href ?? obj?.url ?? obj?.src ?? obj?.hdUrl ?? params?.href ?? params?.url

//     const thumbnail = obj?.thumb ?? obj?.thumbnail ?? obj?.icon ?? params?.thumb ?? params?.thumbnail

//     const name = obj?.title ?? obj?.name ?? obj?.fileName ?? params?.fileName ?? params?.filename

//     const size = toNumber(obj?.size) ?? toNumber(obj?.fileSize) ?? toNumber(params?.fileSize)

//     const mimeType = obj?.mimeType ?? obj?.mimetype ?? params?.mimeType ?? params?.fileType

//     const type = inferTypeFromUrlOrName(url, name, obj?.type ?? obj?.msgType ?? mimeType)

//     if (!url && !thumbnail && !name && !mimeType && size == null) {
//       return null
//     }

//     return {
//       type,
//       url,
//       name,
//       size,
//       mimeType,
//       thumbnail,
//     }
//   }

//   const addAttachment = (value: any) => {
//     if (!value) return

//     if (Array.isArray(value)) {
//       for (const item of value) {
//         const normalized = normalizeAttachment(item)
//         if (normalized) attachments.push(normalized)
//       }
//       return
//     }

//     const normalized = normalizeAttachment(value)
//     if (normalized) attachments.push(normalized)
//   }

//   addAttachment(content)
//   addAttachment(content?.attachments)
//   addAttachment(content?.media)
//   addAttachment(content?.medias)
//   addAttachment(content?.files)
//   addAttachment(content?.images)

//   addAttachment(data?.attachment)
//   addAttachment(data?.attachments)
//   addAttachment(data?.media)
//   addAttachment(data?.medias)
//   addAttachment(data?.file)
//   addAttachment(data?.files)
//   addAttachment(data?.image)
//   addAttachment(data?.images)
//   addAttachment(data?.video)
//   addAttachment(data?.audio)
//   addAttachment(data?.sticker)

//   const uniqueAttachments = attachments.filter((item, index, arr) => {
//     const key = `${item.type}|${item.url ?? ""}|${item.name ?? ""}|${item.thumbnail ?? ""}`
//     return arr.findIndex((x) => `${x.type}|${x.url ?? ""}|${x.name ?? ""}|${x.thumbnail ?? ""}` === key) === index
//   })

//   let type: MessageType = "unknown"

//   if (uniqueAttachments.length > 0) {
//     type = uniqueAttachments[0].type
//   } else if (typeof text === "string" && text.trim()) {
//     type = "text"
//   } else {
//     const hint = String(data?.msgType ?? raw?.msgType ?? data?.type ?? raw?.type ?? "").toLowerCase()

//     if (hint.includes("sticker")) type = "sticker"
//     else if (hint.includes("image")) type = "image"
//     else if (hint.includes("video")) type = "video"
//     else if (hint.includes("audio") || hint.includes("voice")) type = "audio"
//     else if (hint.includes("file")) type = "file"
//     else if (hint.includes("text") || hint.includes("chat") || hint.includes("webchat")) type = "text"
//   }

//   return {
//     provider: "zalo_personal",
//     eventName: raw?.isSelf ? EventMessage.OUTBOUND : EventMessage.INBOUND,
//     isGroupMessage: raw?.type === 1,
//     messageId,
//     conversationId,
//     senderId,
//     recipientId,
//     timestamp,
//     type,
//     text: typeof text === "string" ? text : undefined,
//     attachments: uniqueAttachments.length ? uniqueAttachments : undefined,
//   }
// }
