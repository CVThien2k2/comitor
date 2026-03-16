export type ZaloPersonalThreadType = 0 | 1 // 0: user, 1: group

export type ZaloPersonalMsgType =
  | "webchat"
  | "chat.photo"
  | "chat.sticker"
  | "share.file"
  | "chat.voice"
  | "chat.video.msg"
  | string

export interface ZaloPersonalMessagePropertyExt {
  color?: number
  size?: number
  type?: number
  subType?: number
  ext?: string
}

export interface ZaloPersonalMessageParamsExt {
  countUnread?: number
  containType?: number
  platformType?: number
  [key: string]: unknown
}

export interface ZaloPersonalFileParams {
  fileSize?: string
  checksum?: string
  [key: string]: unknown
}

export interface ZaloPersonalAttachmentContent {
  title?: string
  description?: string
  href?: string
  thumb?: string
  childnumber?: number
  action?: string
  params?: string
}

export interface ZaloPersonalImageContent {
  href?: string
  url?: string
  thumb?: string
  thumbnail?: string
  width?: number
  height?: number
  [key: string]: unknown
}

export interface ZaloPersonalStickerContent {
  id?: string
  cateId?: string
  type?: string
  url?: string
  thumb?: string
  thumbnail?: string
  [key: string]: unknown
}

export type ZaloPersonalMessageContent =
  | string
  | ZaloPersonalAttachmentContent
  | ZaloPersonalImageContent
  | ZaloPersonalStickerContent
  | Record<string, unknown>

export interface ZaloPersonalMessageData {
  actionId?: string
  msgId: string
  cliMsgId?: string
  msgType: ZaloPersonalMsgType
  uidFrom: string
  idTo: string
  dName?: string
  ts: string
  status?: number
  content?: ZaloPersonalMessageContent
  notify?: string
  ttl?: number
  userId?: string
  uin?: string
  topOut?: string
  topOutTimeOut?: string
  topOutTmpTimeOut?: string
  propertyExt?: ZaloPersonalMessagePropertyExt
  paramsExt?: ZaloPersonalMessageParamsExt
  cmd?: number
  st?: number
  at?: number
  realMsgId?: string
  [key: string]: unknown
}

export interface ZaloPersonalListenerBase {
  type: ZaloPersonalThreadType
  threadId?: string
  thread_id?: string
  isSelf?: boolean
  [key: string]: unknown
}

export interface ZaloPersonalMessageListener extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData
}

export interface ZaloPersonalTextMessageWebhook extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData & {
    msgType: "webchat"
    content: string
  }
}

export interface ZaloPersonalFileMessageWebhook extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData & {
    msgType: "share.file"
    content: ZaloPersonalAttachmentContent
  }
}

export interface ZaloPersonalImageMessageWebhook extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData & {
    msgType: "chat.photo" | string
    content: ZaloPersonalImageContent
  }
}

export interface ZaloPersonalStickerMessageWebhook extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData & {
    msgType: "chat.sticker" | string
    content?: ZaloPersonalStickerContent | string
  }
}

export interface ZaloPersonalVoiceMessageWebhook extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData & {
    msgType: "chat.voice" | string
    content?: Record<string, unknown> | string
  }
}

export interface ZaloPersonalVideoMessageWebhook extends ZaloPersonalListenerBase {
  data: ZaloPersonalMessageData & {
    msgType: "chat.video.msg" | string
    content?: Record<string, unknown> | string
  }
}

export type ZaloPersonalWebhook =
  | ZaloPersonalTextMessageWebhook
  | ZaloPersonalFileMessageWebhook
  | ZaloPersonalImageMessageWebhook
  | ZaloPersonalStickerMessageWebhook
  | ZaloPersonalVoiceMessageWebhook
  | ZaloPersonalVideoMessageWebhook
  | ZaloPersonalMessageListener
