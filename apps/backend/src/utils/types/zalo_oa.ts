export type ZaloOaProfileResponse = {
  data?: Record<string, unknown>
  error?: number
  message?: string
}

export interface ZaloUploadImageResponse {
  data?: {
    attachment_id?: string
  }
  error?: number
  message?: string
}

export interface ZaloUploadFileResponse {
  data?: {
    token?: string
  }
  error?: number
  message?: string
}

export const ZALO_OA_EVENTS = {
  user_send_text: "INBOUND_MESSAGE_TEXT",
  user_send_image: "INBOUND_MESSAGE_IMAGE",
  user_send_file: "INBOUND_MESSAGE_FILE",
  user_send_video: "INBOUND_MESSAGE_VIDEO",
  user_send_audio: "INBOUND_MESSAGE_AUDIO",
  user_send_sticker: "INBOUND_MESSAGE_STICKER",
  oa_send_text: "OUTBOUND_MESSAGE_TEXT",
  oa_send_image: "OUTBOUND_MESSAGE_IMAGE",
  oa_send_file: "OUTBOUND_MESSAGE_FILE",
  oa_send_video: "OUTBOUND_MESSAGE_VIDEO",
  oa_send_audio: "OUTBOUND_MESSAGE_AUDIO",
  oa_send_sticker: "OUTBOUND_MESSAGE_STICKER",
} as const
