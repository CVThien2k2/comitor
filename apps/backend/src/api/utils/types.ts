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
