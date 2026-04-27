import { ChannelType, Gender } from "@workspace/database"
import { ContentMessage, EventMessage, MessagePlatform, MessageType, UserProfilePlatform } from "src/utils/types"

export const mapAccountInfo = async (api: any) => {
  const raw = (await api.fetchAccountInfo?.()) ?? {}
  const profile = raw.profile ?? {}
  const cookie = api.getCookie?.() ?? null
  if (!profile.userId || !cookie) throw new Error("Có lỗi xảy ra khi lấy thông tin tài khoản Zalo")

  return {
    provider: "zalo_personal" as ChannelType,
    accountId: profile.userId as string,
    displayName: (profile.displayName ?? profile.zaloName ?? profile.username ?? "Unknown") as string,
    avatarUrl: (profile.avatar ?? null) as string,
    credentials: {
      cookie,
      imei: api.listener?.ctx?.imei ?? null,
      userAgent: api.listener?.ctx?.userAgent ?? null,
      profile,
    },
  }
}

const mapMessageType = (type: string): MessageType | null => {
  switch (type) {
    case "webchat":
      return MessageType.TEXT
    case "chat.photo":
      return MessageType.IMAGE
    case "share.file":
      return MessageType.FILE
    case "chat.video.msg":
      return MessageType.VIDEO
    case "chat.voice":
      return MessageType.AUDIO
    case "chat.sticker":
      return MessageType.STICKER
    case "chat.recommended": //Danh thiếp
      return MessageType.RECOMMENDED
    case "chat.webcontent": // Tài khoản ngân hàng
      return MessageType.TEMPLATE
    case "chat.location.new": // Vị trí
      return MessageType.LOCATION
    case "chat.gif": // GIF
      return MessageType.GIF
    default:
      return null
  }
}

const mapEventMessage = (isSelf: boolean): EventMessage => (isSelf ? EventMessage.OUTBOUND : EventMessage.INBOUND)

const mapIsGroupMessage = (type: number): boolean => (type === 1 ? true : false) // 1: Group, 0: Personal

const parseJson = (value: unknown): any => {
  if (typeof value !== "string") return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const firstDefined = (...values: any[]) => values.find((value) => value !== undefined && value !== null && value !== "")

const mapContentMessage = (data: any, type: MessageType): ContentMessage[] => {
  const rawContent = data?.content
  const base: ContentMessage = {
    quote_msg_id: data?.quote?.globalMsgId ? String(data.quote.globalMsgId) : data?.quote?.cliMsgId?.toString(),
  }

  if (typeof rawContent === "string") {
    return [{ ...base, text: rawContent }]
  }

  if (!rawContent || typeof rawContent !== "object") return []

  const params = parseJson(rawContent.params) ?? rawContent.params ?? {}
  const location = params?.location ?? params?.loc ?? rawContent.location ?? rawContent.coordinates
  const latitude = firstDefined(location?.latitude, location?.lat, params?.latitude, params?.lat, rawContent.latitude, rawContent.lat)
  const longitude = firstDefined(
    location?.longitude,
    location?.lng,
    location?.long,
    params?.longitude,
    params?.lng,
    params?.long,
    rawContent.longitude,
    rawContent.lng,
    rawContent.long
  )

  const content: ContentMessage = {
    ...base,
    type: rawContent.type ?? data?.msgType,
    text: rawContent.title ?? params?.title ?? params?.text ?? params?.msg,
    url: firstDefined(rawContent.href, rawContent.url, params?.href, params?.url, params?.oriUrl, params?.normalUrl),
    thumbnailUrl: firstDefined(rawContent.thumb, rawContent.thumbnail, rawContent.thumbUrl, params?.thumb, params?.thumbnail, params?.thumbUrl),
    name: firstDefined(rawContent.title, rawContent.name, params?.fileName, params?.name),
    description: firstDefined(rawContent.description, params?.description, params?.desc),
    size: firstDefined(rawContent.size, params?.size, params?.fileSize),
    stickerId: firstDefined(rawContent.id, rawContent.stickerId, params?.id, params?.stickerId),
    coordinates:
      type === MessageType.LOCATION && latitude !== undefined && longitude !== undefined
        ? { latitude: String(latitude), longitude: String(longitude) }
        : undefined,
  }

  return [content]
}

export const mapMessage = (message: any): MessagePlatform | null => {
  const type = mapMessageType(message?.data?.msgType)
  const eventName = mapEventMessage(message.isSelf)
  const isGroupMessage = mapIsGroupMessage(message.type)
  const data = message.data
  if (!type || !eventName || !data) return null
  const content = mapContentMessage(data, type)
  if (!content.length) return null

  return {
    eventName,
    provider: "zalo_personal" as ChannelType,
    isGroupMessage,
    messageId: data.msgId,
    senderId: data.uidFrom,
    recipientId: data.idTo,
    timestamp: Number(data.ts) || Date.now(),
    type,
    content,
  }
}

export const mapUserProfile = (user: any): UserProfilePlatform => {
  return {
    accountId: user.userId,
    fullName: user.displayName || user.zaloName || user.username || "Unknown",
    gender: user.gender === 0 ? Gender.male : user.gender === 1 ? Gender.female : Gender.other,
    dateOfBirth: user.sdob,
    primaryPhone: user.phoneNumber,
    avatarUrl: user.avatar,
    bgavatar: user.bgavatar || user.cover,
    isFriend: user.isFr === 1,
    isBlocked: user.isBlocked === 1,
    isActive: user.isActive === 1,
  }
}
