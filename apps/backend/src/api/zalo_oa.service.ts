import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { GoldenProfile } from "@workspace/database"
import dotenv from "dotenv"
import fs from "fs"
import { UploadService } from "src/upload/upload.service"
import { FetchWrapper } from "../common/http/fetch.wrapper"
import { mapProfileToGoldenProfile } from "./utils/helper"
import { SendMessagePayload } from "src/utils/types"
import { streamToBlob } from "src/utils/helper/file"
import { ZaloOaProfileResponse, ZaloUploadFileResponse, ZaloUploadImageResponse } from "src/utils/types"

dotenv.config()

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

  constructor(
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService
  ) {}

  async getProfile(userId: string): Promise<Partial<GoldenProfile>> {
    const ERR_CODE_TOKEN_EXPIRED = -220
    const fetchWrapper = new FetchWrapper(`${this.configService.get("ZALO_OA_API_URL")}`)
    const headers = {
      access_token: this.configService.get("ZALO_OA_ACCESS_TOKEN"),
    }

    const response = await fetchWrapper.get<ZaloOaProfileResponse>(
      `/v3.0/oa/user/detail?data={"user_id":${userId}}`,
      {},
      headers
    )

    if (!response || ("error" in response && response.error === ERR_CODE_TOKEN_EXPIRED)) {
      await this.refreshToken()
    }

    const goldenProfile = mapProfileToGoldenProfile(response, userId)

    return goldenProfile
  }

  async refreshToken() {
    const bodyPayload = {
      app_id: this.configService.get("ZALO_OA_ID"),
      grant_type: "refresh_token",
      refresh_token: this.configService.get("ZALO_OA_REFRESH_TOKEN"),
    }
    const headerPayload = {
      "Content-Type": "application/x-www-form-urlencoded",
    }

    const fetchWrapper = new FetchWrapper(`${this.configService.get("ZALO_OA_AUTH_API_URL")}`)
    const response = await fetchWrapper.post<{ data: { access_token: string; refresh_token: string } }>(
      `/v4/oa/access_token`,
      { body: bodyPayload },
      headerPayload
    )

    /**
     * Fix cứng refresh token và access token vào .env file để các request sau có thể sử dụng được token mới.
     * Chạy lại ứng dụng mỗi khi refresh token để load lại các giá trị token mới từ .env file.
     */
    const env = fs.readFileSync(".env", "utf8")
    const updatedAccessToken = env.replace(
      /ZALO_OA_ACCESS_TOKEN=.*/g,
      `ZALO_OA_ACCESS_TOKEN=${response.data.access_token}`
    )
    const updatedRefreshToken = updatedAccessToken.replace(
      /ZALO_OA_REFRESH_TOKEN=.*/g,
      `ZALO_OA_REFRESH_TOKEN=${response.data.refresh_token}`
    )

    fs.writeFileSync(".env", updatedAccessToken)
    fs.writeFileSync(".env", updatedRefreshToken)

    return response.data
  }

  async sendAttachments(payload: Pick<SendMessagePayload, "attachments" | "recipientId">) {
    const fetchWrapper = new FetchWrapper(`${this.configService.get("ZALO_OA_API_URL")}`)
    const headers = {
      access_token: this.configService.get("ZALO_OA_ACCESS_TOKEN"),
    }
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

    return Promise.all(
      files.map(async (file) => {
        const isValidFile =
          this.allowedFileTypes.includes(file.contentType || "") &&
          Number(file.contentLength?.toString()) <= this.MAX_FILE_SIZE
        const isValidImage =
          file.contentType?.startsWith("image/") &&
          this.allowedImageTypes.includes(file.contentType || "") &&
          Number(file.contentLength?.toString()) <= this.MAX_IMAGE_SIZE

        if (isValidFile || isValidImage)
          throw new BadRequestException(
            "Zalo OA chỉ hỗ trợ file PDF, DOC/DOCX dưới 20MB và ảnh với định dạng JPEG/PNG/GIF dưới 1MB"
          )

        const formData = new FormData()
        const fileBlob = await streamToBlob(file.stream, file.contentType)

        formData.append("file", fileBlob, file.name)

        if (file.contentType?.startsWith("image/")) {
          const uploadData = await fetchWrapper.post<ZaloUploadImageResponse, FormData>(
            `/v2.0/oa/upload/image`,
            {
              body: formData,
            },
            headers
          )

          if (uploadData.error || !uploadData.data?.attachment_id) {
            throw new Error(uploadData.message || "Upload image tới Zalo không thành công")
          }

          return fetchWrapper.post(
            `/v3.0/oa/message/cs`,
            {
              body: {
                ...bodyPayload,
                message: {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "media",
                      elements: [
                        {
                          media_type: "image",
                          attachment_id: uploadData.data.attachment_id,
                        },
                      ],
                    },
                  },
                },
              },
            },
            headers
          )
        }

        const uploadData = await fetchWrapper.post<ZaloUploadFileResponse, FormData>(
          `/v2.0/oa/upload/file`,
          {
            body: formData,
          },
          headers
        )

        if (uploadData.error || !uploadData.data?.token) {
          throw new Error(uploadData.message || "Upload file tới Zalo không thành công")
        }

        return fetchWrapper.post(
          `/v3.0/oa/message/cs`,
          {
            body: {
              ...bodyPayload,
              message: {
                attachment: {
                  type: "file",
                  payload: {
                    token: uploadData.data.token,
                  },
                },
              },
            },
          },
          headers
        )
      })
    )
  }

  async sendMessage(payload: SendMessagePayload) {
    const fetchWrapper = new FetchWrapper(`${this.configService.get("ZALO_OA_API_URL")}`)
    const headers = {
      access_token: this.configService.get("ZALO_OA_ACCESS_TOKEN"),
    }
    const bodyPayload = {
      recipient: {
        user_id: payload.recipientId,
      },
    }

    // Gửi tin nhắn chỉ có text
    if (payload.text && payload.attachments.length === 0)
      return fetchWrapper.post(
        `/v3.0/oa/message/cs`,
        {
          body: {
            ...bodyPayload,
            message: {
              text: payload.text,
            },
          },
        },
        headers
      )

    // Gửi tin nhắn template (1 text + 1 ảnh)
    if (payload.text && payload.attachments.length === 1) {
      const file = await this.uploadService.getStream(payload.attachments[0])
      const isImage =
        file.contentType?.startsWith("image/") && Number(file.contentLength?.toString()) <= this.MAX_FILE_SIZE

      if (isImage) {
        const formData = new FormData()
        const fileBlob = await streamToBlob(file.stream, file.contentType)

        formData.append("file", fileBlob, file.name)

        const uploadData = await fetchWrapper.post<ZaloUploadImageResponse, FormData>(
          `/v2.0/oa/upload/image`,
          {
            body: formData,
          },
          headers
        )

        if (uploadData.error || !uploadData.data?.attachment_id) {
          throw new Error(uploadData.message || "Upload ảnh tới Zalo không thành công")
        }

        const attachmentId = uploadData.data.attachment_id

        return fetchWrapper.post(
          `/v3.0/oa/message/cs`,
          {
            body: {
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
            },
          },
          headers
        )
      }
    }

    // Gửi tin nhắn media (1 text + nhiều ảnh hoặc file)
    if (payload.text && payload.attachments.length > 1) {
      await this.sendAttachments(payload)

      if (payload.text) {
        return fetchWrapper.post(
          `/v3.0/oa/message/cs`,
          {
            body: {
              ...bodyPayload,
              message: {
                text: payload.text,
              },
            },
          },
          headers
        )
      }
    } else if (!payload.text && payload.attachments.length > 0) {
      return await this.sendAttachments(payload)
    }

    throw new BadRequestException("Payload không hợp lệ")
  }
}
