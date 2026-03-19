import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { FetchWrapper } from "src/common/http/fetch.wrapper"
import { UploadService } from "src/upload/upload.service"
import { SendMessagePayload } from "src/utils/types"
import { mapMetaProfileToGoldenProfile } from "./utils/helper"
import { streamToBlob } from "src/utils/helper/file"
import {
  MetaAttachmentError,
  MetaAttachmentResponse,
  MetaAttachmentSendResult,
  MetaAttachmentType,
  MetaProfileResponse,
  UploadedMetaAttachment,
} from "../utils/types"

@Injectable()
export class MetaService {
  private metaAllowedFileTypes = [
    // Image
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",

    // Video
    "video/mp4",
    "video/avi",
    "video/quicktime", // .mov
    "video/webm",

    // Audio
    "audio/mpeg", // .mp3
    "audio/mp4", // .m4a
    "audio/wav",
    "audio/ogg",

    // Documents
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/zip",
  ]

  constructor(
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService
  ) {}

  /**
   *
   * @param userId : meta user id của người mà hệ thống đang muốn lấy profile
   * @param pageId : page id của trang đang có cuộc trò chuyện với khách hàng. (Phục vụ cho trường hợp page có nhiều agent và muốn lấy profile của khách hàng theo page)
   */
  async getProfile(userId: string, pageId?: string) {
    const accessToken = this.configService.get<string>("META_ACCESS_TOKEN")
    if (!accessToken) throw new UnauthorizedException("Tài khoản Meta chưa được liên kết với hệ thống")
    const profileFields = ["name", "first_name", "last_name", "profile_pic", "gender", "locale", "timezone"]
    const urlGetProfile = `/${userId}?fields=${profileFields.join(",")}&access_token=${accessToken}`
    const fetchWrapper: FetchWrapper = new FetchWrapper("https://graph.facebook.com")

    const response = await fetchWrapper.get<MetaProfileResponse>(urlGetProfile)

    Logger.log(`Meta profile response: ${JSON.stringify(response)}`)

    return mapMetaProfileToGoldenProfile(response, userId)
  }

  private resolveMetaAttachmentType(file: { contentType?: string; contentLength?: number }): MetaAttachmentType {
    const contentType = file.contentType || ""
    const contentLength = Number(file.contentLength?.toString() ?? 0)

    if (!this.metaAllowedFileTypes.includes(contentType)) {
      throw new Error(`Loại file ${contentType} không được hỗ trợ để gửi qua Meta`)
    }

    if (contentType.startsWith("image/") && contentLength <= 25 * 1024 * 1024) {
      return "image"
    }

    if (contentType.startsWith("video/") && contentLength <= 50 * 1024 * 1024) {
      return "video"
    }

    if (contentType.startsWith("audio/") && contentLength <= 10 * 1024 * 1024) {
      return "audio"
    }

    if (contentType.startsWith("application/") && contentLength <= 25 * 1024 * 1024) {
      return "file"
    }

    throw new Error(`Kích thước file ${contentType} vượt quá giới hạn gửi qua Meta`)
  }

  async sendAttachments(recipientId: string, attachmentKeys: string[]): Promise<MetaAttachmentSendResult> {
    const accessToken = this.configService.get<string>("META_ACCESS_TOKEN")
    if (!accessToken) throw new UnauthorizedException("Tài khoản Meta chưa được liên kết với hệ thống")
    const fetchWrapper: FetchWrapper = new FetchWrapper("https://graph.facebook.com")
    const urlSendAttachments = `https://graph.facebook.com/v20.0/me/message_attachments?access_token=${accessToken}`
    const urlSendMessage = `/v21.0/me/messages?access_token=${accessToken}`
    const responses: unknown[] = []
    const uploadedAttachments: UploadedMetaAttachment[] = []
    const errors: MetaAttachmentError[] = []
    let currentAttachment = ""
    let currentFileName: string | undefined

    Logger.log(`Meta send attachments: recipientId=${recipientId}, attachmentKeys=${attachmentKeys.join(",")}`)

    try {
      for (const attachment of attachmentKeys) {
        currentAttachment = attachment
        const file = await this.uploadService.getStream(attachment)
        currentFileName = file.name
        const attachmentType = this.resolveMetaAttachmentType(file)
        const formData = new FormData()
        const fileBlob = await streamToBlob(file.stream, file.contentType)

        formData.append("recipient", JSON.stringify({ id: recipientId }))
        formData.append(
          "message",
          JSON.stringify({ attachment: { type: attachmentType, payload: { is_reusable: true } } })
        )
        formData.append("filedata", fileBlob, file.name)

        const response = await fetchWrapper.post<MetaAttachmentResponse>(urlSendAttachments, { body: formData })

        if (!response?.attachment_id) {
          throw new Error(`Upload file ${file.name} lên Meta không trả về attachment_id`)
        }

        uploadedAttachments.push({
          attachmentId: response.attachment_id,
          type: attachmentType,
          sourceKey: attachment,
          fileName: file.name,
        })
      }

      for (const attachment of uploadedAttachments) {
        const responseSendMessage = await fetchWrapper.post(urlSendMessage, {
          body: {
            recipient: {
              id: recipientId,
            },
            message: {
              attachment: {
                type: attachment.type,
                payload: {
                  attachment_id: attachment.attachmentId,
                },
              },
            },
          },
        })
        responses.push(responseSendMessage)
      }

      return {
        success: true,
        responses,
        uploadedAttachments,
        errors,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"

      Logger.error(`Gửi file qua Meta thất bại: ${message}`, error instanceof Error ? error.stack : undefined)

      errors.push({
        attachment: currentAttachment,
        fileName: currentFileName,
        message,
      })

      return {
        success: false,
        responses,
        uploadedAttachments,
        errors,
      }
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<Record<string, unknown>> {
    const accessToken = this.configService.get<string>("META_ACCESS_TOKEN")
    if (!accessToken) throw new UnauthorizedException("Tài khoản Meta chưa được liên kết với hệ thống")
    const fetchWrapper: FetchWrapper = new FetchWrapper("https://graph.facebook.com")
    const urlSendMessage = `/v21.0/me/messages?access_token=${accessToken}`
    const attachments = payload.attachments || []
    const finalResponse: Record<string, unknown> = {
      recipientId: payload.recipientId,
      senderId: payload.senderId,
    }

    // headers payload
    const headers = {
      "Content-Type": "application/json",
    }

    if (payload.attachments && payload.attachments.length > 0) {
      const responseSendAttachments = await this.sendAttachments(payload.recipientId, attachments)

      if (!responseSendAttachments.success) {
        finalResponse.attachmentErrors = responseSendAttachments.errors

        if (!payload.text) {
          throw new Error(`Gửi file qua Meta không thành công`)
        }
      }

      if (responseSendAttachments.responses.length > 0) {
        finalResponse.attachments = payload.attachments
      }

      if (
        !payload.text &&
        (!responseSendAttachments.responses.length || responseSendAttachments.responses.length !== attachments.length)
      ) {
        throw new Error(`Gửi file qua Meta không thành công`)
      }
    }

    if (payload.text) {
      const response = await fetchWrapper.post(
        urlSendMessage,
        {
          body: {
            recipient: {
              id: payload.recipientId,
            },
            message: {
              text: payload.text,
            },
          },
        },
        headers
      )

      Logger.log(`Meta send message response: ${JSON.stringify(response)}`)

      finalResponse.text = payload.text
    }

    return finalResponse
  }
}
