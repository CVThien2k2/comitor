// import { BadRequestException, Injectable, Logger } from "@nestjs/common"
// import { extname } from "path"
// import { UploadService } from "src/upload/upload.service"
// import { streamToBuffer } from "src/utils/helper/file"
// import { ZaloPersonalSessionService } from "./zalo_personal-session.service"
// import { stringifyUnknownError } from "./utils/error"

// const CAPTIONABLE_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])
// const SUPPORTED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"])
// const SUPPORTED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"])
// const SUPPORTED_VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".avi", ".mkv", ".webm"])
// const SUPPORTED_VIDEO_MIME_TYPES = new Set([
//   "video/mp4",
//   "video/quicktime",
//   "video/x-msvideo",
//   "video/x-matroska",
//   "video/webm",
// ])
// const SUPPORTED_DOCUMENT_EXTENSIONS = new Set([
//   ".pdf",
//   ".doc",
//   ".docx",
//   ".xls",
//   ".xlsx",
//   ".ppt",
//   ".pptx",
//   ".txt",
//   ".zip",
//   ".rar",
// ])
// const SUPPORTED_DOCUMENT_MIME_TYPES = new Set([
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "text/plain",
//   "application/zip",
//   "application/x-zip-compressed",
//   "application/vnd.rar",
//   "application/x-rar-compressed",
// ])
// const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024
// const ZALO_THREAD_TYPE_USER = 0
// const ZALO_THREAD_TYPE_GROUP = 1

// type ZaloPersonalAttachmentSource = {
//   data: Buffer
//   filename: `${string}.${string}`
//   metadata: {
//     totalSize: number
//     width?: number
//     height?: number
//   }
// }

// type ZaloPersonalAttachmentInput = {
//   fileName?: string | null
//   fileType?: string | null
//   fileUrl?: string | null
//   fileMimeType?: string | null
//   key?: string | null
// }

// type ZaloPersonalMessagePayload = {
//   msg: string
//   attachments?: ZaloPersonalAttachmentSource | ZaloPersonalAttachmentSource[]
// }

// @Injectable()
// export class ZaloPersonalMessageService {
//   private readonly logger = new Logger(ZaloPersonalMessageService.name)

//   constructor(
//     private readonly uploadService: UploadService,
//     private readonly zaloPersonalSessionService: ZaloPersonalSessionService
//   ) {}

//   async sendText(api: any, threadId: string, threadType: number, text: string) {
//     const payload: ZaloPersonalMessagePayload = {
//       msg: text,
//     }

//     return await api.sendMessage(payload, threadId, threadType)
//   }

//   async sendCombinedMessage(
//     api: any,
//     threadId: string,
//     threadType: number,
//     text: string,
//     attachments: ZaloPersonalAttachmentInput[]
//   ) {
//     const attachmentSources = await this.buildAttachmentSources(attachments)

//     const payload: ZaloPersonalMessagePayload = {
//       msg: text,
//       attachments: attachmentSources,
//     }

//     await api.sendMessage(payload, threadId, threadType)
//   }

//   async sendAttachments(api: any, threadId: string, threadType: number, attachments: ZaloPersonalAttachmentInput[]) {
//     try {
//       const attachmentSources = await this.buildAttachmentSources(attachments)

//       const payload: ZaloPersonalMessagePayload = {
//         msg: "",
//         attachments: attachmentSources,
//       }

//       this.logger.log(`Gửi tin nhắn với ${attachmentSources.length} attachments`, {
//         threadId,
//         threadType,
//         attachmentFileNames: attachmentSources.map((a) => a.filename),
//       })

//       return await api.sendMessage(payload, threadId, threadType)
//     } catch (error) {
//       this.logger.error("Gửi tin nhắn với attachment thất bại", stringifyUnknownError(error))
//       throw error
//     }
//   }

//   private async buildAttachmentSources(
//     attachments: ZaloPersonalAttachmentInput[]
//   ): Promise<ZaloPersonalAttachmentSource[]> {
//     return Promise.all(attachments.map((attachment) => this.buildAttachmentSource(attachment)))
//   }

//   private async buildAttachmentSource(attachment: ZaloPersonalAttachmentInput): Promise<ZaloPersonalAttachmentSource> {
//     const normalizedKey = attachment.key?.trim()

//     if (!normalizedKey) {
//       throw new BadRequestException("Attachment key không hợp lệ")
//     }

//     const file = await this.uploadService.getStream(normalizedKey)
//     const normalizedFilename = this.normalizeAttachmentFilename(attachment.fileName || file.name)
//     const fileExtension = extname(normalizedFilename).toLowerCase()
//     const contentType =
//       attachment.fileMimeType?.split(";")[0]?.trim().toLowerCase() ||
//       file.contentType?.split(";")[0]?.trim().toLowerCase() ||
//       ""
//     const declaredSize = Number(file.contentLength ?? 0)
//     const normalizedFileType = attachment.fileType?.trim().toLowerCase() || ""

//     const isImage =
//       normalizedFileType === "image" ||
//       SUPPORTED_IMAGE_MIME_TYPES.has(contentType) ||
//       SUPPORTED_IMAGE_EXTENSIONS.has(fileExtension)
//     const isVideo =
//       normalizedFileType === "video" ||
//       SUPPORTED_VIDEO_MIME_TYPES.has(contentType) ||
//       SUPPORTED_VIDEO_EXTENSIONS.has(fileExtension)
//     const isDocument =
//       normalizedFileType === "file" ||
//       normalizedFileType === "document" ||
//       SUPPORTED_DOCUMENT_EXTENSIONS.has(fileExtension) ||
//       (SUPPORTED_DOCUMENT_MIME_TYPES.has(contentType) &&
//         !SUPPORTED_IMAGE_MIME_TYPES.has(contentType) &&
//         !SUPPORTED_VIDEO_MIME_TYPES.has(contentType)) ||
//       (contentType === "application/octet-stream" && SUPPORTED_DOCUMENT_EXTENSIONS.has(fileExtension))

//     if (!isImage && !isVideo && !isDocument) {
//       throw new BadRequestException(
//         `Zalo Personal chỉ hỗ trợ gửi ảnh, video và tài liệu phổ biến. File ${normalizedFilename} không được hỗ trợ`
//       )
//     }

//     if (Number.isFinite(declaredSize) && declaredSize > MAX_ATTACHMENT_SIZE) {
//       throw new BadRequestException(`File ${normalizedFilename} vượt quá giới hạn 100MB của Zalo`)
//     }

//     const buffer = await streamToBuffer(file.stream)
//     const totalSize = Number(file.contentLength ?? buffer.length)

//     if (totalSize > MAX_ATTACHMENT_SIZE) {
//       throw new BadRequestException(`File ${normalizedFilename} vượt quá giới hạn 100MB của Zalo`)
//     }

//     return {
//       data: buffer,
//       filename: normalizedFilename,
//       metadata: {
//         totalSize: Number.isFinite(totalSize) && totalSize > 0 ? totalSize : buffer.length,
//       },
//     }
//   }

//   private normalizeAttachmentFilename(fileName?: string): `${string}.${string}` {
//     const normalizedFileName = fileName?.trim() || "attachment.bin"

//     if (normalizedFileName.includes(".") && !normalizedFileName.endsWith(".")) {
//       return normalizedFileName as `${string}.${string}`
//     }

//     return `${normalizedFileName}.bin` as `${string}.${string}`
//   }

//   private isCaptionableImage(attachmentKey: string) {
//     return CAPTIONABLE_IMAGE_EXTENSIONS.has(extname(attachmentKey).toLowerCase())
//   }
// }
