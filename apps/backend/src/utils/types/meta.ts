export type MetaAttachmentType = "image" | "video" | "audio" | "file"

export interface MetaAttachmentResponse {
  attachment_id: string
  message_id: string
  recipient_id: string
}

export interface UploadedMetaAttachment {
  attachmentId: string
  type: MetaAttachmentType
  sourceKey: string
  fileName: string
}

export interface MetaAttachmentError {
  attachment: string
  fileName?: string
  message: string
}

export interface MetaAttachmentSendResult {
  success: boolean
  responses: unknown[]
  uploadedAttachments: UploadedMetaAttachment[]
  errors: MetaAttachmentError[]
}

export type MetaProfileResponse = {
  id?: string
  name?: string
  first_name?: string
  last_name?: string
  profile_pic?: string
  gender?: string
  locale?: string
  timezone?: number
}

export const META_EVENTS = {
  user_send_message: "INBOUND_MESSAGE",
  admin_send_message: "OUTBOUND_MESSAGE",
} as const
