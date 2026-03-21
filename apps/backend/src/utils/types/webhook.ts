export interface ZaloOAMessageWebhook {
  event_name: string
  app_id: string
  sender: {
    id: string
    admin_id?: string
  }
  recipient: {
    id: string
  }
  message: {
    msg_id: string
    text?: string
    attachments?: {
      type: "image" | "file" | "sticker"
      payload: {
        url?: string
        thumbnail?: string
        name?: string
        size?: string
        checksum?: string
        type?: string
        id?: string
      }
    }[]
  }
  timestamp: string
  user_id_by_app: string
}

export interface MetaMessageWebhook {
  object: "page"
  entry: {
    id: string
    time: number
    messaging: {
      sender: {
        id: string
      }
      recipient: {
        id: string
      }
      timestamp: number
      message: {
        is_echo?: boolean
        mid: string
        text?: string
        attachments?: {
          type: "image" | "file" | "video" | "audio"
          payload: {
            url?: string
            attachment_url?: string
            file_url?: string
            src?: string
            thumbnail?: string
            thumbnail_url?: string
            name?: string
            title?: string
            filename?: string
            size?: string | number
            mime_type?: string
            content_type?: string
          }
        }[]
      }
    }[]
  }[]
}
