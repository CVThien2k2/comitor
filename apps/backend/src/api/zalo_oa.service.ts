import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import dotenv from "dotenv"
import { UploadService } from "src/upload/upload.service"
import { streamToBlob } from "src/utils/helper/file"
import {
  SendMessagePayload,
  ZaloOaProfileResponse,
  ZaloUploadFileResponse,
  ZaloUploadImageResponse,
} from "src/utils/types"
import { ZaloOaAuthService } from "./zalo_oa_auth.service"
import { mapProfileToGoldenProfile } from "./utils/helper"
import { RedisService } from "src/redis"
import { PrismaService } from "src/database/prisma.service"
import { MessageSenderResponse } from "src/platform/message-senders/message-sender.interface"

dotenv.config()

export type ZaloOaSendMessageResponse = {
  data: {
    message_id: string
    sent_time: number
    user_id: string
  }
  message: string
  error: number
}

@Injectable()
export class ZaloOaService {
  private allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  private allowedImageTypes = ["image/jpeg", "image/png", "image/gif"]
  private MAX_FILE_SIZE = 20 * 1024 * 1024
  private MAX_IMAGE_SIZE = 1 * 1024 * 1024
  private readonly ERR_CODE_TOKEN_EXPIRED = -220

  constructor(
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService,
    private readonly zaloOaAuthService: ZaloOaAuthService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService
  ) {}

  private zaloApiBase(): string {
    const base = this.configService.get<string>("ZALO_OA_API_URL")
    if (!base) throw new Error("Missing ZALO_OA_API_URL")
    return base
  }

  private isTokenExpiredResponse(json: any): boolean {
    const error = json?.error ?? json?.data?.error
    if (error === this.ERR_CODE_TOKEN_EXPIRED) return true
    const msg = String(json?.message ?? json?.data?.message ?? "")
    return msg.toLowerCase().includes("expired")
  }

  private async getCachedToken(
    senderId: string
  ): Promise<{ access_token: string; refresh_token?: string; expires_in?: number } | null> {
    const cached = await this.redis.get<{ access_token: string; refresh_token?: string; expires_in?: number }>(
      `link_account:zalo_oa:${senderId}`
    )
    if (cached?.access_token) {
      return cached
    }

    const linked = await this.prisma.client.linkAccount.findFirst({
      where: { provider: "zalo_oa", accountId: senderId },
      include: { providerCredentials: true },
    })
    const accessToken = linked?.providerCredentials?.accessToken ?? undefined
    const refreshToken = linked?.providerCredentials?.refreshToken ?? undefined
    const expiresAt = linked?.providerCredentials?.accessTokenExpiresAt ?? undefined

    if (!accessToken) {
      return null
    }

    const ttl = expiresAt ? Math.max(30, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) : 3500
    const token = { access_token: accessToken, refresh_token: refreshToken, expires_in: ttl }
    await this.redis.set(`link_account:zalo_oa:${senderId}`, token, ttl)
    return token
  }

  private async setCachedToken(
    senderId: string,
    token: { access_token: string; refresh_token: string; expires_in?: number }
  ) {
    const ttl = typeof token.expires_in === "number" && token.expires_in > 0 ? token.expires_in : 3500
    await this.redis.set(
      `link_account:zalo_oa:${senderId}`,
      { access_token: token.access_token, refresh_token: token.refresh_token, expires_in: ttl },
      ttl
    )
  }

  private async fetchZaloJson<T>(params: {
    senderId: string
    path: string
    init: RequestInit
    retryOnExpired?: boolean
  }): Promise<T> {
    const retryOnExpired = params.retryOnExpired ?? true
    const base = this.zaloApiBase()
    const token = await this.getCachedToken(params.senderId)
    const accessToken = token?.access_token ?? ""

    const headers = new Headers(params.init.headers as any)
    headers.set("access_token", accessToken)

    const res = await fetch(`${base}${params.path}`, { ...params.init, headers })
    const json = (await res.json()) as any

    if (retryOnExpired && this.isTokenExpiredResponse(json)) {
      const refreshed = await this.zaloOaAuthService.refreshToken({ refreshToken: token?.refresh_token })
      const retryHeaders = new Headers(params.init.headers as any)
      retryHeaders.set("access_token", refreshed.access_token)
      await this.setCachedToken(params.senderId, refreshed)
      const res2 = await fetch(`${base}${params.path}`, { ...params.init, headers: retryHeaders })
      const json2 = (await res2.json()) as any
      return json2 as T
    }

    return json as T
  }

  async getProfile(userId: string, senderId: string) {
    const profile = await this.fetchZaloJson<ZaloOaProfileResponse>({
      senderId,
      path: `/v3.0/oa/user/detail?data={"user_id":${userId}}`,
      init: { method: "GET" },
    })

    return mapProfileToGoldenProfile(profile, userId)
  }

  async sendAttachments(
    payload: Pick<SendMessagePayload, "attachments" | "recipientId" | "senderId" | "conversationId">
  ): Promise<any> {
    const bodyPayload = {
      recipient: {
        user_id: payload.recipientId,
      },
    }
    const attachments = payload.attachments ?? []

    const files = await Promise.all(
      attachments.map(async (key) => {
        const file = await this.uploadService.getStream(key)
        return file
      })
    )

    let lastResponses: MessageSenderResponse[] = []

    await Promise.all(
      files.map(async (file) => {
        const contentLength = Number(file.contentLength?.toString())
        const isValidFile =
          this.allowedFileTypes.includes(file.contentType || "") &&
          Number.isFinite(contentLength) &&
          contentLength <= this.MAX_FILE_SIZE
        const isValidImage =
          file.contentType?.startsWith("image/") &&
          this.allowedImageTypes.includes(file.contentType || "") &&
          Number.isFinite(contentLength) &&
          contentLength <= this.MAX_IMAGE_SIZE

        if (!isValidFile && !isValidImage)
          throw new BadRequestException(
            "Zalo OA chỉ hỗ trợ file PDF, DOC/DOCX dưới 20MB và ảnh với định dạng JPEG/PNG/GIF dưới 1MB"
          )

        const formData = new FormData()
        const fileBlob = await streamToBlob(file.stream, file.contentType)

        formData.append("file", fileBlob, file.name)

        if (file.contentType?.startsWith("image/")) {
          const uploadData = await this.fetchZaloJson<ZaloUploadImageResponse>({
            senderId: payload.senderId,
            path: `/v2.0/oa/upload/image`,
            init: { method: "POST", body: formData },
          })

          const attachmentId = (uploadData as any)?.data?.attachment_id ?? (uploadData as any)?.attachment_id
          if (!attachmentId) {
            throw new Error((uploadData as any)?.message || "Upload image tới Zalo không thành công")
          }

          const response = await this.fetchZaloJson<Partial<ZaloOaSendMessageResponse>>({
            senderId: payload.senderId,
            path: `/v3.0/oa/message/cs`,
            init: {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...bodyPayload,
                message: {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "media",
                      elements: [
                        {
                          media_type: "image",
                          attachment_id: attachmentId,
                        },
                      ],
                    },
                  },
                },
              }),
            },
          })

          lastResponses.push({
            messageId: response?.data?.message_id || "",
            conversationId: payload.conversationId,
            userId: response?.data?.user_id || payload.recipientId,
          } as MessageSenderResponse)

          return {
            messageId: response?.data?.message_id || "",
            conversationId: payload.conversationId,
            userId: response?.data?.user_id || payload.senderId,
          } as MessageSenderResponse
        }

        const uploadData = await this.fetchZaloJson<ZaloUploadFileResponse>({
          senderId: payload.senderId,
          path: `/v2.0/oa/upload/file`,
          init: { method: "POST", body: formData },
        })

        const token = (uploadData as any)?.data?.token ?? (uploadData as any)?.token
        if (!token) {
          throw new Error((uploadData as any)?.message || "Upload file tới Zalo không thành công")
        }

        const response = await this.fetchZaloJson<Partial<ZaloOaSendMessageResponse>>({
          senderId: payload.senderId,
          path: `/v3.0/oa/message/cs`,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bodyPayload,
              message: {
                attachment: {
                  type: "file",
                  payload: {
                    token,
                  },
                },
              },
            }),
          },
        })

        lastResponses.push({
          messageId: response?.data?.message_id || "",
          conversationId: payload.conversationId,
          userId: response?.data?.user_id || payload.recipientId,
        } as MessageSenderResponse)

        return {
          messageId: response?.data?.message_id || "",
          conversationId: payload.conversationId,
          userId: response?.data?.user_id || payload.recipientId,
        } as MessageSenderResponse
      })
    )

    return lastResponses
  }

  async sendMessage(payload: SendMessagePayload): Promise<MessageSenderResponse | MessageSenderResponse[]> {
    const bodyPayload = {
      recipient: {
        user_id: payload.recipientId,
      },
    }

    // Gửi tin nhắn chỉ có text
    if (payload.text && (!payload.attachments || payload.attachments.length === 0)) {
      const response = await this.fetchZaloJson<ZaloOaSendMessageResponse>({
        senderId: payload.senderId,
        path: `/v3.0/oa/message/cs`,
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bodyPayload,
            message: { text: payload.text },
          }),
        },
      })

      return {
        messageId: response.data.message_id,
        conversationId: payload.conversationId,
        userId: response.data.user_id || payload.recipientId,
      }
    }

    // Gửi tin nhắn template (1 text + 1 ảnh)
    if (
      payload.text &&
      payload.attachments &&
      payload.attachments.length === 1 &&
      ["jpeg", "png", "gif"].includes(
        payload.attachments[0].split("/")[payload.attachments[0].split("/").length - 1].split(".")[1]
      )
    ) {
      const file = await this.uploadService.getStream(payload.attachments[0])
      const contentLength = Number(file.contentLength?.toString())
      const isImage =
        file.contentType?.startsWith("image/") &&
        this.allowedImageTypes.includes(file.contentType || "") &&
        Number.isFinite(contentLength) &&
        contentLength <= this.MAX_IMAGE_SIZE

      if (isImage) {
        const formData = new FormData()
        const fileBlob = await streamToBlob(file.stream, file.contentType)

        formData.append("file", fileBlob, file.name)

        const uploadData = await this.fetchZaloJson<any>({
          senderId: payload.senderId,
          path: `/v2.0/oa/upload/image`,
          init: { method: "POST", body: formData },
        })

        const attachmentId = uploadData?.data?.attachment_id ?? uploadData?.attachment_id
        if (!attachmentId) {
          throw new Error(uploadData?.message || "Upload ảnh tới Zalo không thành công")
        }

        const response = await this.fetchZaloJson<MessageSenderResponse>({
          senderId: payload.senderId,
          path: `/v3.0/oa/message/cs`,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bodyPayload,
              message: {
                text: payload.text,
                attachment: {
                  type: "template",
                  payload: {
                    template_type: "media",
                    elements: [
                      {
                        media_type: "image",
                        attachment_id: attachmentId,
                      },
                    ],
                  },
                },
              },
            }),
          },
        })

        return response
      }
    } else if (payload.text && payload.attachments && payload.attachments.length >= 1) {
      // Gửi tin nhắn media (1 text + nhiều ảnh hoặc file)
      const response = await this.sendAttachments(payload)

      if (payload.text) {
        const textResponse = (await this.fetchZaloJson({
          senderId: payload.senderId,
          path: `/v3.0/oa/message/cs`,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bodyPayload,
              message: {
                text: payload.text,
              },
            }),
          },
        })) as ZaloOaSendMessageResponse
        response.push({
          messageId: textResponse.data.message_id,
          conversationId: payload.conversationId,
          userId: textResponse.data.user_id || payload.recipientId,
        })
      }

      return response
    } else if (!payload.text && payload.attachments && payload.attachments.length > 0) {
      const response = (await this.sendAttachments(payload)) as any

      return response
    }

    throw new BadRequestException("Payload không hợp lệ")
  }
}
