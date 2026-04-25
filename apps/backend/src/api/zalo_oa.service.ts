import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { UploadService } from "src/upload/upload.service"
import { streamToBlob } from "src/utils/helper/file"
import {
  SendMessagePayload,
  ZaloOaProfileResponse,
  ZaloUploadFileResponse,
  ZaloUploadImageResponse,
} from "src/utils/types"
import { ZaloOaAuthService } from "./zalo_oa_auth.service"
import {
  getZaloOaAccessTokenRedisKey,
  getZaloOaRefreshTokenRedisKey,
  ZALO_OA_ACCESS_TOKEN_TTL_SECONDS,
  ZALO_OA_REFRESH_TOKEN_TTL_SECONDS,
} from "./zalo_oa.redis"
import { mapProfileToGoldenProfile } from "./utils/helper"
import { RedisService } from "src/redis/redis.service"
import { PrismaService } from "src/database/prisma.service"
import { MessageSenderResponse } from "src/platform/message-senders/message-sender.interface"

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
  private readonly ERR_CODE_ACCESS_TOKEN_EXPIRED = -216
  private readonly ERR_CODE_REFRESH_TOKEN_EXPIRED = -220
  private readonly REAUTH_REQUIRED_MESSAGE =
    "Phiên Zalo OA đã hết hạn, vui lòng liên kết lại tài khoản để tiếp tục sử dụng"

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
    if (error === this.ERR_CODE_ACCESS_TOKEN_EXPIRED) return true
    if (error === this.ERR_CODE_REFRESH_TOKEN_EXPIRED) return true
    const msg = String(json?.message ?? json?.data?.message ?? "")
    return msg.toLowerCase().includes("expired")
  }

  private async cacheTokenPair(senderId: string, token: { access_token?: string; refresh_token?: string }) {
    await Promise.all([
      token.access_token
        ? this.redis.set(getZaloOaAccessTokenRedisKey(senderId), token.access_token, ZALO_OA_ACCESS_TOKEN_TTL_SECONDS)
        : Promise.resolve(),
      token.refresh_token
        ? this.redis.set(
            getZaloOaRefreshTokenRedisKey(senderId),
            token.refresh_token,
            ZALO_OA_REFRESH_TOKEN_TTL_SECONDS
          )
        : Promise.resolve(),
    ])
  }

  private async refreshAndPersistToken(senderId: string, refreshToken?: string) {
    if (!refreshToken) {
      throw new Error(this.REAUTH_REQUIRED_MESSAGE)
    }

    try {
      const refreshed = await this.zaloOaAuthService.refreshToken({ refreshToken })
      await this.setCachedToken(senderId, refreshed)
      return refreshed
    } catch {
      throw new Error(this.REAUTH_REQUIRED_MESSAGE)
    }
  }

  private async getCachedToken(senderId: string) {
    // throw new Error(this.REAUTH_REQUIRED_MESSAGE)
    // const [cachedAccessToken, cachedRefreshToken] = await Promise.all([
    //   this.redis.get<string>(getZaloOaAccessTokenRedisKey(senderId)),
    //   this.redis.get<string>(getZaloOaRefreshTokenRedisKey(senderId)),
    // ])
    // if (cachedAccessToken) {
    //   return {
    //     access_token: cachedAccessToken,
    //     refresh_token: cachedRefreshToken ?? undefined,
    //     expires_in: ZALO_OA_ACCESS_TOKEN_TTL_SECONDS,
    //   }
    // }
    // const linked = await this.prisma.client.linkAccount.findFirst({
    //   where: { provider: "zalo_oa", accountId: senderId },
    //   include: { providerCredentials: true },
    // })
    // const accessToken = linked?.providerCredentials?.accessToken ?? undefined
    // const refreshToken = cachedRefreshToken ?? linked?.providerCredentials?.refreshToken ?? undefined
    // if (!accessToken && !refreshToken) {
    //   throw new Error(this.REAUTH_REQUIRED_MESSAGE)
    // }
    // if (accessToken) {
    //   await this.cacheTokenPair(senderId, {
    //     access_token: accessToken,
    //     refresh_token: refreshToken,
    //   })
    //   return {
    //     access_token: accessToken,
    //     refresh_token: refreshToken,
    //     expires_in: ZALO_OA_ACCESS_TOKEN_TTL_SECONDS,
    //   }
    // }
    // if (!refreshToken) {
    //   throw new Error(this.REAUTH_REQUIRED_MESSAGE)
    // }
    // return this.refreshAndPersistToken(senderId, refreshToken)
  }

  private async setCachedToken(
    senderId: string,
    token: { access_token: string; refresh_token: string; expires_in?: number }
  ) {
    // throw new Error(this.REAUTH_REQUIRED_MESSAGE)
    // const accessTokenLifetimeSeconds =
    //   typeof token.expires_in === "number" && token.expires_in > 0 ? token.expires_in : ZALO_OA_ACCESS_TOKEN_TTL_SECONDS
    // const linkAccount = await this.prisma.client.linkAccount.findFirst({
    //   where: { provider: "zalo_oa", accountId: senderId },
    // })
    // if (!linkAccount?.id) {
    //   throw new Error("Không tìm thấy liên kết Zalo OA để cập nhật token")
    // }
    // await this.cacheTokenPair(senderId, token)
    // await this.prisma.client.providerCredentials.upsert({
    //   where: { linkAccountId: linkAccount.id },
    //   update: {
    //     accessToken: token.access_token,
    //     refreshToken: token.refresh_token,
    //     accessTokenExpiresAt: new Date(Date.now() + accessTokenLifetimeSeconds * 1000),
    //     refreshTokenExpiresAt: new Date(Date.now() + ZALO_OA_REFRESH_TOKEN_TTL_SECONDS * 1000),
    //   },
    //   create: {
    //     linkAccountId: linkAccount.id,
    //     accessToken: token.access_token,
    //     refreshToken: token.refresh_token,
    //     accessTokenExpiresAt: new Date(Date.now() + accessTokenLifetimeSeconds * 1000),
    //     refreshTokenExpiresAt: new Date(Date.now() + ZALO_OA_REFRESH_TOKEN_TTL_SECONDS * 1000),
    //     credentialType: "oauth2",
    //   },
    // })
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
    const accessToken = "" //token?.access_token ?? ""

    const headers = new Headers(params.init.headers)
    headers.set("access_token", accessToken)

    const res = await fetch(`${base}${params.path}`, { ...params.init, headers })
    const json = await res.json()

    if (retryOnExpired && this.isTokenExpiredResponse(json)) {
      const refreshed = await this.refreshAndPersistToken(params.senderId, "") //token?.refresh_token)
      const retryHeaders = new Headers(params.init.headers as any)
      retryHeaders.set("access_token", refreshed.access_token)
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

  /**
   * Upload a single image to Zalo OA and return the attachment_id.
   */
  private async uploadImageToZalo(senderId: string, file: { stream: any; contentType?: string; name?: string }) {
    const formData = new FormData()
    const fileBlob = await streamToBlob(file.stream, file.contentType)
    formData.append("file", fileBlob, file.name)

    const uploadData = await this.fetchZaloJson<ZaloUploadImageResponse>({
      senderId,
      path: `/v2.0/oa/upload/image`,
      init: { method: "POST", body: formData },
    })

    const attachmentId = (uploadData as any)?.data?.attachment_id ?? (uploadData as any)?.attachment_id
    if (!attachmentId) {
      throw new Error((uploadData as any)?.message || "Upload image tới Zalo không thành công")
    }
    return attachmentId as string
  }

  /**
   * Send all images in a single Zalo OA message using media template with multiple elements.
   * Zalo renders this as a grid on the user's device.
   */
  private async sendImageGridMessage(
    payload: Pick<SendMessagePayload, "recipientId" | "senderId" | "conversationId">,
    files: Array<{ stream: any; contentType?: string; name?: string }>
  ): Promise<MessageSenderResponse[]> {
    const attachmentIds = await Promise.all(files.map((file) => this.uploadImageToZalo(payload.senderId, file)))

    const response = await this.fetchZaloJson<Partial<ZaloOaSendMessageResponse>>({
      senderId: payload.senderId,
      path: `/v3.0/oa/message/cs`,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { user_id: payload.recipientId },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "media",
                elements: attachmentIds.slice(0, 5).map((attachmentId) => ({
                  media_type: "image",
                  attachment_id: attachmentId,
                })),
              },
            },
          },
        }),
      },
    })

    return [
      {
        messageId: response?.data?.message_id || "",
        conversationId: payload.conversationId,
        userId: response?.data?.user_id || payload.recipientId,
      } as MessageSenderResponse,
    ]
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

    const allAreValidImages =
      files.length > 0 &&
      files.every((file) => {
        const contentLength = Number(file.contentLength?.toString())
        return (
          file.contentType?.startsWith("image/") &&
          this.allowedImageTypes.includes(file.contentType || "") &&
          Number.isFinite(contentLength) &&
          contentLength <= this.MAX_IMAGE_SIZE
        )
      })

    if (allAreValidImages) {
      return this.sendImageGridMessage(payload, files)
    }

    const lastResponses: MessageSenderResponse[] = []

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

          return
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
        const textResponse = await this.fetchZaloJson<ZaloOaSendMessageResponse>({
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
        })
        response.push({
          messageId: textResponse.data.message_id,
          conversationId: payload.conversationId,
          userId: textResponse.data.user_id || payload.recipientId,
        })
      }

      return response
    } else if (!payload.text && payload.attachments && payload.attachments.length > 0) {
      const response = await this.sendAttachments(payload)

      return response
    }

    throw new BadRequestException("Payload không hợp lệ")
  }
}
