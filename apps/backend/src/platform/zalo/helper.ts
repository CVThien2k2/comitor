import { ChannelType, ConversationType, Gender, MessageSender, MessageType } from "@workspace/database"
import { ContentMessage, MessagePlatform, UserProfilePlatform } from "src/utils/types"

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
      return MessageType.text
    case "chat.photo":
      return MessageType.image
    case "share.file":
      return MessageType.file
    case "chat.video.msg":
      return MessageType.video
    case "chat.voice":
      return MessageType.audio
    case "chat.sticker":
      return MessageType.sticker
    case "chat.recommended": //Danh thiếp
      return MessageType.recommended
    case "chat.webcontent": // Tài khoản ngân hàng
      return MessageType.template
    case "chat.location.new": // Vị trí
      return MessageType.location
    case "chat.gif": // GIF
      return MessageType.gif
    default:
      return null
  }
}

const mapSenderType = (isSelf: boolean): MessageSender => (isSelf ? MessageSender.agent : MessageSender.customer)

const mapConversationType = (type: number): ConversationType =>
  type === 1 ? ConversationType.group : ConversationType.personal // 1: Group, 0: Personal

const parseJson = (value: unknown): any => {
  if (typeof value !== "string") return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const firstDefined = (...values: any[]) => values.find((value) => value !== undefined && value !== null && value !== "")

const normalizeDateOfBirth = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === "") return undefined

  const toIsoDate = (year: number, month: number, day: number): string | undefined => {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined
    if (year < 1900 || year > 2100) return undefined
    if (month < 1 || month > 12) return undefined
    if (day < 1 || day > 31) return undefined

    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return undefined
    }

    return date.toISOString().slice(0, 10)
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const timestamp = value > 9999999999 ? value : value * 1000
    const date = new Date(timestamp)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
  }

  if (typeof value !== "string") return undefined
  const raw = value.trim()
  if (!raw) return undefined

  if (/^\d+$/.test(raw)) {
    if (raw.length === 8) {
      const firstYear = Number(raw.slice(0, 4))
      if (firstYear >= 1900 && firstYear <= 2100) {
        return toIsoDate(firstYear, Number(raw.slice(4, 6)), Number(raw.slice(6, 8)))
      }
      return toIsoDate(Number(raw.slice(4, 8)), Number(raw.slice(2, 4)), Number(raw.slice(0, 2)))
    }

    const timestampNumber = Number(raw)
    if (Number.isFinite(timestampNumber) && raw.length >= 10) {
      const timestamp = raw.length > 10 ? timestampNumber : timestampNumber * 1000
      const date = new Date(timestamp)
      return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
    }
  }

  const parts = raw.split(/[/\-.]/).map((part) => part.trim())
  if (parts.length === 3 && parts.every((part) => /^\d+$/.test(part))) {
    const [a, b, c] = parts.map(Number)
    if (parts[0].length === 4) return toIsoDate(a, b, c)
    if (parts[2].length === 4) return toIsoDate(c, b, a)
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10)
}

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
  const latitude = firstDefined(
    location?.latitude,
    location?.lat,
    params?.latitude,
    params?.lat,
    rawContent.latitude,
    rawContent.lat
  )
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
    thumbnailUrl: firstDefined(
      rawContent.thumb,
      rawContent.thumbnail,
      rawContent.thumbUrl,
      params?.thumb,
      params?.thumbnail,
      params?.thumbUrl
    ),
    name: firstDefined(rawContent.title, rawContent.name, params?.fileName, params?.name),
    description: firstDefined(rawContent.description, params?.description, params?.desc),
    size: firstDefined(rawContent.size, params?.size, params?.fileSize),
    stickerId: firstDefined(rawContent.id, rawContent.stickerId, params?.id, params?.stickerId),
    coordinates:
      type === MessageType.location && latitude !== undefined && longitude !== undefined
        ? { latitude: String(latitude), longitude: String(longitude) }
        : undefined,
  }

  return [content]
}

export const mapMessage = (message: any, linkedAccountId: string): MessagePlatform | null => {
  const type = mapMessageType(message?.data?.msgType)
  const senderType = mapSenderType(message.isSelf)
  const typeConversation = mapConversationType(message.type)

  const isSelf = message.isSelf
  const isGroup = typeConversation === ConversationType.group
  const data = message.data
  if (!type || !data) return null
  const content = mapContentMessage(data, type)
  if (!content.length) return null

  /* 
  Id của cuộc trò chuyện:
    + Nếu là nhóm:
      - TH1: Tin nhắn không phải của mình gửi => người khác gửi tới nhóm zalo liên kết đang ở => idTo (Nhóm nhận tin nhắn), uidFrom (Người gửi tin nhắn lưu cho hồ sơ khách hàng)
      - TH2: Tin nhắn của mình gửi => Mình gủi đến nhóm => uidFrom là của linkAccount, idTo là nhóm zalo liên kết đang ở, không có idCustomer
    + Nếu là cá nhân: 
      - TH1: Tin nhắn không phải của mình gửi => người khác gửi tới tài khoản zalo mình => uidFrom (Người gửi tin nhắn lưu cho hồ sơ khách hàng), idTo (Tài khoản zalo liên kết nhận tin nhắn)
      - TH2: Tin nhắn của mình gửi => Mình gủi đến tài khoản khách hàng => uidFrom là của linkAccount, idTo là tài khoản của khách hàng
  */
  const externalConversationId = !isSelf ? (isGroup ? data.idTo : data.uidFrom) : data.idTo
  const accountCustomerId = isSelf ? (isGroup ? null : data.idTo) : data.uidFrom

  if (!externalConversationId || !data.msgId) return null
  return {
    provider: "zalo_personal" as ChannelType,
    typeConversation,
    externalConversationId,
    externalMessageId: data.msgId,
    accountCustomerId,
    linkedAccountId,
    senderType,
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
    dateOfBirth: normalizeDateOfBirth(user.sdob),
    primaryPhone: user.phoneNumber,
    avatarUrl: user.avatar,
    bgavatar: user.bgavatar || user.cover,
    isFriend: user.isFr === 1,
    isBlocked: user.isBlocked === 1,
    isActive: user.isActive === 1,
  }
}
