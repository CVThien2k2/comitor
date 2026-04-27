import { ChannelType } from "@workspace/database"
import { ContentMessage, EventMessage, MessagePlatform, MessageType } from "src/utils/types"

const ZALO_OA_MESSAGE_EVENT = {
  user_send_text: { eventName: EventMessage.INBOUND, type: MessageType.TEXT }, // Người dùng gửi tin nhắn văn bản
  user_send_image: { eventName: EventMessage.INBOUND, type: MessageType.IMAGE }, // Người dùng gửi tin nhắn hình ảnh
  user_send_link: { eventName: EventMessage.INBOUND, type: MessageType.TEXT }, // Người dùng gửi tin nhắn liên kết
  user_send_audio: { eventName: EventMessage.INBOUND, type: MessageType.AUDIO }, // Người dùng gửi tin nhắn âm thanh
  user_send_video: { eventName: EventMessage.INBOUND, type: MessageType.VIDEO }, // Người dùng gửi tin nhắn video
  user_send_sticker: { eventName: EventMessage.INBOUND, type: MessageType.STICKER }, // Người dùng gửi tin nhắn sticker
  user_send_location: { eventName: EventMessage.INBOUND, type: MessageType.LOCATION }, // Người dùng gửi vị trí
  user_send_file: { eventName: EventMessage.INBOUND, type: MessageType.FILE }, // Người dùng gửi file
  user_send_gif: { eventName: EventMessage.INBOUND, type: MessageType.GIF }, // Người dùng gửi tin nhắn GIF
  user_send_business_card: { eventName: EventMessage.INBOUND, type: MessageType.RECOMMENDED }, // Người dùng gửi danh thiếp
  // user_reacted_message: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng thả cảm xúc vào tin nhắn
  // user_click_chatnow: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng click nút Chat ngay
  // user_seen_message: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng đã xem tin nhắn OA
  // user_received_message: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng đã nhận tin nhắn OA
  // user_feedback: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng gửi feedback
  // follow: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng theo dõi OA
  // unfollow: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng bỏ theo dõi OA
  // user_submit_info: { eventName: EventMessage.INBOUND, type: MessageType.TEMPLATE }, // Người dùng chia sẻ thông tin

  //Outbound
  oa_send_text: { eventName: EventMessage.OUTBOUND, type: MessageType.TEXT }, // OA gửi tin nhắn văn bản
  oa_send_image: { eventName: EventMessage.OUTBOUND, type: MessageType.IMAGE }, // OA gửi tin nhắn hình ảnh
  oa_send_gif: { eventName: EventMessage.OUTBOUND, type: MessageType.GIF }, // OA gửi tin nhắn có ảnh GIF
  oa_send_file: { eventName: EventMessage.OUTBOUND, type: MessageType.FILE }, // OA gửi tin nhắn đính kèm file
  oa_send_sticker: { eventName: EventMessage.OUTBOUND, type: MessageType.STICKER }, // OA gửi tin nhắn sticker
  // oa_reacted_message: { eventName: EventMessage.OUTBOUND, type: MessageType.TEMPLATE }, // OA thả cảm xúc vào tin nhắn người dùng
  // oa_send_list: { eventName: EventMessage.OUTBOUND, type: MessageType.TEMPLATE }, // OA gửi tin nhắn tương tác dạng danh sách
  // oa_send_template: { eventName: EventMessage.OUTBOUND, type: MessageType.TEMPLATE }, // OA gửi tin nhắn tương tác dạng template
} satisfies Record<string, { eventName: EventMessage; type: MessageType; group?: boolean }>

export const mapZaloOaWebhook = (payload: any): MessagePlatform | null => {
  const e = ZALO_OA_MESSAGE_EVENT[payload.event_name]
  if (!e) return null

  return {
    eventName: e.eventName,
    provider: "zalo_oa" as ChannelType,
    isGroupMessage: e.group ?? false,
    messageId: payload.message.msg_id,
    senderId: payload.sender.id,
    recipientId: payload.recipient.id,
    timestamp: Date.now(),
    type: e.type,
    content: [mapContentMessage(payload)],
  }
}

// Chuẩn hóa nội dung từ payload Zalo OA về ContentMessage nội bộ.
const mapContentMessage = (payload: any): ContentMessage => {
  const message = payload?.message
  const attachments = message?.attachments
  const content: ContentMessage = {}
  if (attachments?.[0]?.payload) {
    const attachmentPayload = attachments[0].payload
    if (attachmentPayload?.type) content.type = attachmentPayload.type
    if (attachmentPayload?.url) content.url = attachmentPayload.url
    if (attachmentPayload?.thumbnail) content.thumbnailUrl = attachmentPayload.thumbnail
    if (attachmentPayload?.name) content.name = attachmentPayload.name
    if (attachmentPayload?.description) content.description = attachmentPayload.description
    if (attachmentPayload?.id) content.stickerId = attachmentPayload.id
    if (attachmentPayload?.coordinates) content.coordinates = attachmentPayload.coordinates
  }
  if (message?.text) content.text = message.text
  if (message?.quote_msg_id) content.quote_msg_id = message.quote_msg_id
  return content
}
// Meta Webhook
// Map payload webhook Meta (object.page.entry[]) thành danh sách message nội bộ.
export const mapMetasWebhook = (payload: any): MessagePlatform[] | null => {
  const entrys = payload?.entry
  if (!entrys?.length) return null
  const messages = entrys.flatMap((entry: any) =>
    (entry?.messaging ?? [])
      .map((messaging: any) => mapMetaMessaging(messaging, entry?.time))
      .filter((message: MessagePlatform | null) => message !== null)
  )
  return messages.length ? messages : null
}

// Map payload change đơn lẻ từ Meta về MessagePlatform.
export const mapMetaChange = (change: any): MessagePlatform | null => {
  const messaging = change?.messaging?.find((item: any) => item?.message)
  return mapMetaMessaging(messaging, change?.time)
}

// Map một item messaging của Meta về MessagePlatform chuẩn.
const mapMetaMessaging = (messaging: any, entryTime?: number): MessagePlatform | null => {
  const message = messaging?.message
  if (!messaging || !message) return null

  const content = mapMetaContentMessage(message)
  if (!content.length) return null

  return {
    eventName: message.is_echo ? EventMessage.OUTBOUND : EventMessage.INBOUND,
    provider: "facebook" as ChannelType,
    isGroupMessage: false,
    messageId: message.mid,
    senderId: messaging.sender?.id,
    recipientId: messaging.recipient?.id,
    timestamp: messaging.timestamp ?? entryTime ?? Date.now(),
    type: mapMetaMessageType(message),
    content,
  }
}

// Xác định loại MessageType từ payload message của Meta.
const mapMetaMessageType = (message: any): MessageType => {
  if (message?.text) return MessageType.TEXT

  const attachmentType = message?.attachments?.[0]?.type
  switch (attachmentType) {
    case "image":
      return MessageType.IMAGE
    case "video":
      return MessageType.VIDEO
    case "audio":
      return MessageType.AUDIO
    case "file":
      return MessageType.FILE
    case "location":
      return MessageType.LOCATION
    default:
      return MessageType.TEMPLATE
  }
}

// Trích xuất text/attachment của Meta thành mảng ContentMessage.
const mapMetaContentMessage = (message: any): ContentMessage[] => {
  const content: ContentMessage[] = []

  if (message?.text) {
    content.push({
      text: message.text,
      quote_msg_id: message?.reply_to?.mid,
      type: message?.quick_reply?.payload,
    })
  }

  for (const attachment of message?.attachments ?? []) {
    const payload = attachment?.payload ?? {}
    content.push({
      type: attachment?.type,
      url: payload?.url,
      stickerId: payload?.sticker_id,
    })
  }

  return content
}
