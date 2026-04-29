import { ChannelType, ConversationType, MessageSender, MessageType } from "@workspace/database"
import { ContentMessage, MessagePlatform } from "src/utils/types"

const ZALO_OA_MESSAGE_EVENT = {
  user_send_text: { senderType: MessageSender.customer, type: MessageType.text }, // Người dùng gửi tin nhắn văn bản
  user_send_image: { senderType: MessageSender.customer, type: MessageType.image }, // Người dùng gửi tin nhắn hình ảnh
  user_send_link: { senderType: MessageSender.customer, type: MessageType.text }, // Người dùng gửi tin nhắn liên kết
  user_send_audio: { senderType: MessageSender.customer, type: MessageType.audio }, // Người dùng gửi tin nhắn âm thanh
  user_send_video: { senderType: MessageSender.customer, type: MessageType.video }, // Người dùng gửi tin nhắn video
  user_send_sticker: { senderType: MessageSender.customer, type: MessageType.sticker }, // Người dùng gửi tin nhắn sticker
  user_send_location: { senderType: MessageSender.customer, type: MessageType.location }, // Người dùng gửi vị trí
  user_send_file: { senderType: MessageSender.customer, type: MessageType.file }, // Người dùng gửi file
  user_send_gif: { senderType: MessageSender.customer, type: MessageType.gif }, // Người dùng gửi tin nhắn GIF
  user_send_business_card: { senderType: MessageSender.customer, type: MessageType.recommended }, // Người dùng gửi danh thiếp
  // user_reacted_message: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng thả cảm xúc vào tin nhắn
  // user_click_chatnow: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng click nút Chat ngay
  // user_seen_message: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng đã xem tin nhắn OA
  // user_received_message: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng đã nhận tin nhắn OA
  // user_feedback: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng gửi feedback
  // follow: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng theo dõi OA
  // unfollow: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng bỏ theo dõi OA
  // user_submit_info: { eventName: EventMessage.INBOUND, type: MessageType.template }, // Người dùng chia sẻ thông tin

  //Outbound
  oa_send_text: { senderType: MessageSender.agent, type: MessageType.text }, // OA gửi tin nhắn văn bản
  oa_send_image: { senderType: MessageSender.agent, type: MessageType.image }, // OA gửi tin nhắn hình ảnh
  oa_send_gif: { senderType: MessageSender.agent, type: MessageType.gif }, // OA gửi tin nhắn có ảnh GIF
  oa_send_file: { senderType: MessageSender.agent, type: MessageType.file }, // OA gửi tin nhắn đính kèm file
  oa_send_sticker: { senderType: MessageSender.agent, type: MessageType.sticker }, // OA gửi tin nhắn sticker
  // oa_reacted_message: { eventName: EventMessage.OUTBOUND, type: MessageType.template }, // OA thả cảm xúc vào tin nhắn người dùng
  // oa_send_list: { eventName: EventMessage.OUTBOUND, type: MessageType.template }, // OA gửi tin nhắn tương tác dạng danh sách
  // oa_send_template: { eventName: EventMessage.OUTBOUND, type: MessageType.template }, // OA gửi tin nhắn tương tác dạng template
} satisfies Record<string, { senderType: MessageSender; type: MessageType }>

export const mapZaloOaWebhook = (payload: any): MessagePlatform | null => {
  const e = ZALO_OA_MESSAGE_EVENT[payload.event_name]
  if (!e) return null
  const isCustomer = e.senderType === MessageSender.customer
  const accountCustomerId = isCustomer ? payload.sender?.id : payload.recipient?.id // ID tài khoản khách hàng: người dùng gửi nhân tin nhắn
  const linkedAccountId = isCustomer ? payload.recipient?.id : payload.sender?.id // ID tài khoản hệ thống nhận về tin nhắn này: OA gửi, nhận tin nhắn
  if (!accountCustomerId || !linkedAccountId || !payload.message?.msg_id) return null

  return {
    provider: "zalo_oa" as ChannelType,
    typeConversation: ConversationType.personal,
    externalConversationId: accountCustomerId,
    externalMessageId: payload.message.msg_id,
    accountCustomerId,
    linkedAccountId,
    senderType: e.senderType,
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
  // Chỉ map tin giữa người dùng và page, chưa có nhóm
  const message = messaging?.message
  if (!messaging || !message) return null

  const content = mapMetaContentMessage(message)
  if (!content.length) return null
  const senderType = message.is_echo ? MessageSender.agent : MessageSender.customer
  const accountCustomerId = message.is_echo ? messaging.recipient?.id : messaging.sender?.id // ID tài khoản khách hàng: người dùng gửi nhân tin nhắn
  const linkedAccountId = message.is_echo ? messaging.sender?.id : messaging.recipient?.id // ID tài khoản hệ thống nhận về tin nhắn này: Meta gửi, nhận tin nhắn
  if (!accountCustomerId || !linkedAccountId || !message.mid) return null

  return {
    provider: "facebook" as ChannelType,
    typeConversation: ConversationType.personal,
    externalConversationId: accountCustomerId,
    externalMessageId: message.mid,
    accountCustomerId,
    linkedAccountId,
    senderType,
    timestamp: messaging.timestamp ?? entryTime ?? Date.now(),
    type: mapMetaMessageType(message),
    content,
  }
}

// Xác định loại MessageType từ payload message của Meta.
const mapMetaMessageType = (message: any): MessageType => {
  if (message?.text) return MessageType.text

  const attachmentType = message?.attachments?.[0]?.type
  switch (attachmentType) {
    case "image":
      return MessageType.image
    case "video":
      return MessageType.video
    case "audio":
      return MessageType.audio
    case "file":
      return MessageType.file
    case "location":
      return MessageType.location
    default:
      return MessageType.template
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
