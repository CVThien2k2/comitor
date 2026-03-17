import { Injectable, NotFoundException } from "@nestjs/common"
import { randomUUID } from "crypto"
import {
  Attachment,
  Message,
  MessageType,
  ZaloPersonalMessageListener
} from "src/utils/types"

type LoginStatus =
  | "pending"
  | "qr_ready"
  | "scanned"
  | "authenticated"
  | "failed"

type LoginSession = {
  id: string
  qrImage?: string
  ownId?: string
  displayName?: string
  error?: string
  status: LoginStatus
}

type ActiveZaloSession = {
  id: string
  status: "authenticated" | "failed"
  api: any
}

@Injectable()
export class ZaloPersonalService {
  private readonly sessions = new Map<string, LoginSession>()

  async loginWithQR() {
    const sessionId = randomUUID()
    const zcaJs = (await import("zca-js")) as any
    const zalo = new zcaJs.Zalo({
      selfListen: true,
    })

    const session: LoginSession = {
      id: sessionId,
      status: "pending",
    }
    const activeSession: ActiveZaloSession = {
      id: sessionId,
      status: "failed",
      api: null,
    }

    this.sessions.set(sessionId, session)

    return new Promise<LoginSession>((resolve, reject) => {
      let hasResolvedQr = false

      zalo
        .loginQR({}, async (event: any) => {
          if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeGenerated) {
            session.qrImage = `data:image/png;base64,${event.data.image}`
            session.status = "qr_ready"

            if (!hasResolvedQr) {
              hasResolvedQr = true
              resolve({ ...session })
            }
          }

          if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeScanned) {
            session.status = "scanned"
            session.displayName = event.data.display_name
          }

          if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeExpired) {
            session.status = "failed"
            session.error = "Mã QR đã hết hạn"
          }

          if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeDeclined) {
            session.status = "failed"
            session.error = "Mã QR đã bị từ chối"
          }
        })
        .then((api: any) => {
          api.listener.start()
          session.status = "authenticated"
          session.ownId = api.getOwnId()

          activeSession.status = "authenticated"
          activeSession.api = api

          api.listener.on("message", (message: any) => {
            console.log(
              "New Message Zalo Personal:",
              this.mapZaloPersonal(message)
            )
          })

          api.listener.on("error", (error: unknown) => {
            console.error("Zalo listener error:", error)
          })

          api.listener.on("closed", (code: number, reason: string) => {
            console.log("Zalo listener closed:", code, reason)
          })

          api.listener.start({ retryOnClose: true })
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Đăng nhập bằng mã QR thất bại"

            session.status = "failed"
            session.error = message

          if (!hasResolvedQr) {
            reject(new Error(message))
          }
        })
    })
  }

  getLoginStatus(sessionId: string) {
    const session = this.sessions.get(sessionId)

    if (!session) {
      throw new NotFoundException("Không tìm thấy phiên đăng nhập")
    }

    return session
  }

  mapZaloPersonal(response: ZaloPersonalMessageListener): Message {
    const raw = response ?? {}
    const data = raw?.data ?? raw

    const conversationId =
      String(
        raw?.threadId ??
          raw?.thread_id ??
          data?.threadId ??
          data?.thread_id ??
          data?.idTo ??
          data?.uidFrom ??
          ""
      ) || ""

    const messageId =
      String(
        data?.msgId ??
          data?.messageId ??
          data?.cliMsgId ??
          data?.realMsgId ??
          raw?.msgId ??
          raw?.messageId ??
          ""
      ) || ""

    const senderId =
      String(
        data?.uidFrom ??
          data?.fromId ??
          data?.senderId ??
          raw?.uidFrom ??
          raw?.senderId ??
          ""
      ) || ""

    const recipientId =
      String(
        data?.idTo ??
          data?.toId ??
          data?.recipientId ??
          raw?.idTo ??
          raw?.recipientId ??
          ""
      ) || ""

    const timestamp =
      Number(
        data?.ts ?? data?.timestamp ?? raw?.ts ?? raw?.timestamp ?? Date.now()
      ) || Date.now()

    const content: any = data?.content ?? raw?.content

    const text =
      typeof content === "string"
        ? content
        : typeof data?.msg === "string"
          ? data.msg
          : typeof data?.text === "string"
            ? data.text
            : typeof raw?.text === "string"
              ? raw.text
              : undefined

    const attachments: Attachment[] = []

    const toNumber = (value: unknown): number | undefined => {
      const n = Number(value)
      return Number.isFinite(n) ? n : undefined
    }

    const safeJsonParse = (value: unknown): any => {
      if (typeof value !== "string") return undefined
      try {
        return JSON.parse(value)
      } catch {
        return undefined
      }
    }

    const inferTypeFromUrlOrName = (
      url?: string,
      name?: string,
      explicitType?: string
    ): MessageType => {
      const source =
        `${explicitType ?? ""} ${url ?? ""} ${name ?? ""}`.toLowerCase()

      if (
        source.includes("sticker") ||
        source.includes("emoji") ||
        source.includes(".webp")
      ) {
        return "sticker"
      }
      if (
        source.includes("image") ||
        /\.(jpg|jpeg|png|gif|bmp|webp)(\?|$)/.test(source)
      ) {
        return "image"
      }
      if (
        source.includes("video") ||
        /\.(mp4|mov|avi|mkv|webm)(\?|$)/.test(source)
      ) {
        return "video"
      }
      if (
        source.includes("audio") ||
        source.includes("voice") ||
        /\.(mp3|wav|ogg|m4a|aac)(\?|$)/.test(source)
      ) {
        return "audio"
      }
      if (
        source.includes("file") ||
        source.includes("document") ||
        /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)(\?|$)/.test(source)
      ) {
        return "file"
      }

      return "unknown"
    }

    const normalizeAttachment = (obj: any): Attachment | null => {
      if (!obj || typeof obj !== "object") return null

      const params = safeJsonParse(obj?.params)

      const url =
        obj?.href ??
        obj?.url ??
        obj?.src ??
        obj?.hdUrl ??
        params?.href ??
        params?.url

      const thumbnail =
        obj?.thumb ??
        obj?.thumbnail ??
        obj?.icon ??
        params?.thumb ??
        params?.thumbnail

      const name =
        obj?.title ??
        obj?.name ??
        obj?.fileName ??
        params?.fileName ??
        params?.filename

      const size =
        toNumber(obj?.size) ??
        toNumber(obj?.fileSize) ??
        toNumber(params?.fileSize)

      const mimeType =
        obj?.mimeType ?? obj?.mimetype ?? params?.mimeType ?? params?.fileType

      const type = inferTypeFromUrlOrName(
        url,
        name,
        obj?.type ?? obj?.msgType ?? mimeType
      )

      if (!url && !thumbnail && !name && !mimeType && size == null) {
        return null
      }

      return {
        type,
        url,
        name,
        size,
        mimeType,
        thumbnail,
      }
    }

    const addAttachment = (value: any) => {
      if (!value) return

      if (Array.isArray(value)) {
        for (const item of value) {
          const normalized = normalizeAttachment(item)
          if (normalized) attachments.push(normalized)
        }
        return
      }

      const normalized = normalizeAttachment(value)
      if (normalized) attachments.push(normalized)
    }

    addAttachment(content)
    addAttachment(content?.attachments)
    addAttachment(content?.media)
    addAttachment(content?.medias)
    addAttachment(content?.files)
    addAttachment(content?.images)

    addAttachment(data?.attachment)
    addAttachment(data?.attachments)
    addAttachment(data?.media)
    addAttachment(data?.medias)
    addAttachment(data?.file)
    addAttachment(data?.files)
    addAttachment(data?.image)
    addAttachment(data?.images)
    addAttachment(data?.video)
    addAttachment(data?.audio)
    addAttachment(data?.sticker)

    const uniqueAttachments = attachments.filter((item, index, arr) => {
      const key = `${item.type}|${item.url ?? ""}|${item.name ?? ""}|${item.thumbnail ?? ""}`
      return (
        arr.findIndex(
          (x) =>
            `${x.type}|${x.url ?? ""}|${x.name ?? ""}|${x.thumbnail ?? ""}` ===
            key
        ) === index
      )
    })

    let type: MessageType = "unknown"

    if (uniqueAttachments.length > 0) {
      type = uniqueAttachments[0].type
    } else if (typeof text === "string" && text.trim()) {
      type = "text"
    } else {
      const hint = String(
        data?.msgType ?? raw?.msgType ?? data?.type ?? raw?.type ?? ""
      ).toLowerCase()

      if (hint.includes("sticker")) type = "sticker"
      else if (hint.includes("image")) type = "image"
      else if (hint.includes("video")) type = "video"
      else if (hint.includes("audio") || hint.includes("voice")) type = "audio"
      else if (hint.includes("file")) type = "file"
      else if (
        hint.includes("text") ||
        hint.includes("chat") ||
        hint.includes("webchat")
      )
        type = "text"
    }

    return {
      platform: "zalo_personal",
      messageId,
      conversationId,
      senderId,
      recipientId,
      timestamp,
      type,
      text: typeof text === "string" ? text : undefined,
      attachments: uniqueAttachments.length ? uniqueAttachments : undefined,
    }
  }
}
