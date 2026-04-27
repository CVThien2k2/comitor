import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { EVENTS } from "../../websocket/socket-events"
import type { MessageCreatedEvent } from "../../websocket/socket-event-payloads"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { ConversationService } from "../conversation/conversation.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { UpdateMessageDto } from "./dto/update-message.dto"

import { MessageSender } from "@workspace/database"
import { MessageStatus } from "@workspace/database"
import { MESSAGE_INCLUDE } from "./message.include"

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
}

const normalizeMimeType = (value?: string | null) => {
  const normalized = value?.split(";")[0]?.trim().toLowerCase()
  return normalized || null
}

const inferMimeType = (...values: Array<string | null | undefined>) => {
  const joined = values.filter(Boolean).join(" ").toLowerCase()
  const ext = Object.keys(MIME_BY_EXTENSION).find((candidate) => joined.includes(candidate))
  return ext ? MIME_BY_EXTENSION[ext] : null
}

const getAttachmentMimeType = (input: {
  mimeType?: string | null
  fileType?: string | null
  fileName?: string | null
  fileUrl?: string | null
  type?: string | null
}) => {
  const normalizedMime = normalizeMimeType(input.mimeType)
  if (normalizedMime) return normalizedMime

  const inferredFromExt = inferMimeType(input.fileName, input.fileUrl)
  if (inferredFromExt) return inferredFromExt

  const normalizedType = input.type?.trim().toLowerCase() ?? input.fileType?.trim().toLowerCase() ?? ""
  if (normalizedType === "image") return "image/*"
  if (normalizedType === "video") return "video/*"
  if (normalizedType === "audio") return "audio/*"
  if (normalizedType === "file" || normalizedType === "document") return "application/octet-stream"

  return null
}

export function transformSingleMessage(messages: any[]) {
  if (!messages?.length) return null

  const base = messages.find((m) => m.content) ?? messages[0]

  return {
    id: base.id,
    conversationId: base.conversationId,
    senderType: base.senderType,
    accountCustomerId: base.accountCustomerId ?? null,
    userId: base.userId ?? null,
    content: messages.find((m) => m.content)?.content ?? null,
    status: base.status,
    externalId: base.externalId ?? null,
    isRead: messages.every((m) => m.isRead),
    createdAt: base.createdAt,
    updatedAt: messages.reduce((latest, current) => {
      return new Date(current.updatedAt).getTime() > new Date(latest).getTime() ? current.updatedAt : latest
    }, base.updatedAt),
    attachments: messages.flatMap((m) => m.attachments ?? []),
    user: messages.find((m) => m.user)?.user ?? null,
    accountCustomer: messages.find((m) => m.accountCustomer)?.accountCustomer ?? null,
  }
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly conversationService: ConversationService
  ) {}

  async findByConversationId(conversationId: string, query: PaginationQueryDto) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const { skip, take, page, limit } = paginate(query)

    const where: any = { conversationId }
    if (query.search) {
      where.content = { contains: query.search, mode: "insensitive" }
    }

    const [items, total] = await Promise.all([
      this.prisma.client.message.findMany({
        where,
        include: MESSAGE_INCLUDE,
        orderBy: { timestamp: "desc" },
        skip,
        take,
      }),
      this.prisma.client.message.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const message = await this.prisma.client.message.findUnique({
      where: { id },
      include: MESSAGE_INCLUDE,
    })

    if (!message) throw new NotFoundException("Tin nhắn không tồn tại")

    return message
  }

  async findManyByIds(ids: string[]) {
    return this.prisma.client.message.findMany({
      where: { id: { in: ids } },
      include: MESSAGE_INCLUDE,
    })
  }

  async create(dto: CreateMessageDto, userId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: dto.conversationId },
      include: { linkedAccount: true },
    })

    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")
    if (!conversation.linkedAccount) throw new NotFoundException("Tài khoản liên kết không tồn tại")

    const attachments = Array.isArray(dto.attachments) ? dto.attachments : []
    const hasAttachments = attachments.length > 0
    const hasContent = !!dto.content?.trim()

    if (!hasContent && !hasAttachments) {
      throw new BadRequestException("Message must have content or attachments")
    }

    const messages = await this.prisma.client.$transaction(async (tx) => {
      const createdMessageIds: string[] = []
      // 1. Nếu có text → tạo 1 message text
      // if (hasContent) {
      //   const textMessage = await tx.message.create({
      //     data: {
      //       conversationId: dto.conversationId,
      //       senderType: "agent",
      //       userId,
      //       isRead: true,
      //       timestamp: new Date(),
      //       content: dto.content!.trim(),
      //       status: "processing",
      //     },
      //   })
      //   createdMessageIds.push(textMessage.id)
      // }

      // 2. Nếu có attachments → mỗi attachment = 1 message
      // if (hasAttachments) {
      //   const now = new Date()
      //   const attachmentMessages = await tx.message.createManyAndReturn({
      //     data: attachments.map(() => ({
      //       conversationId: dto.conversationId,
      //       senderType: "agent" as MessageSender,
      //       userId,
      //       isRead: true,
      //       timestamp: now,
      //       content: null,
      //       status: "processing" as MessageStatus,
      //     })),
      //     select: { id: true },
      //   })

      //   await tx.messageAttachment.createMany({
      //     data: attachmentMessages.map((message, index) => ({
      //       messageId: message.id,
      //       fileName: attachments[index].fileName,
      //       fileType: attachments[index].fileType,
      //       fileUrl: attachments[index].fileUrl,
      //       fileMimeType: getAttachmentMimeType({
      //         mimeType: attachments[index].fileMimeType,
      //         fileType: attachments[index].fileType,
      //         fileName: attachments[index].fileName,
      //         fileUrl: attachments[index].fileUrl,
      //       }),
      //       key: attachments[index].key,
      //     })),
      //   })

      //   createdMessageIds.push(...attachmentMessages.map((m) => m.id))
      // }

      // 🔥 3. Query lại messages + include attachments
      const fullMessages = await tx.message.findMany({
        where: {
          id: { in: createdMessageIds },
        },
        include: MESSAGE_INCLUDE,
        orderBy: {
          createdAt: "asc",
        },
      })
      await tx.conversation.update({
        where: { id: dto.conversationId },
        data: { lastActivityAt: new Date() },
      })
      return fullMessages
    })

    // emit events
    messages.forEach((msg) => {
      this.eventEmitter.emit(EVENTS.MESSAGE_CREATED, {
        message: msg,
        linkedAccount: conversation.linkedAccount,
      } satisfies MessageCreatedEvent)
    })

    return transformSingleMessage(messages)
    // return messages
  }

  async update(id: string, dto: UpdateMessageDto) {
    const message = await this.prisma.client.message.findUnique({ where: { id } })
    if (!message) throw new NotFoundException("Tin nhắn không tồn tại")

    return this.prisma.client.message.update({
      where: { id },
      data: {
        content: dto.content,
        isRead: dto.isRead,
      },
    })
  }

  async createInbound(
    data: {
      externalConversationId: string
      linkedAccountId: string
      accountCustomerId: string
      externalId: string
      timestamp: number
      content?: string
      isGroupMessage: boolean
    },
    tx?: TransactionClient
  ) {
    const db = tx ?? this.prisma.client

    // const { conversation, isNew: isNewConversation } = await this.conversationService.getOrCreate(
    //   {
    //     externalId: data.externalConversationId,
    //     linkedAccountId: data.linkedAccountId,
    //     accountCustomerId: data.accountCustomerId,
    //     isGroupMessage: data.isGroupMessage,
    //   },
    //   tx
    // )
    // try {
    //   const message = await db.message.create({
    //     data: {
    //       conversationId: conversation.id,
    //       senderType: "customer",
    //       accountCustomerId: data.accountCustomerId,
    //       externalId: data.externalId,
    //       timestamp: new Date(data.timestamp),
    //       content: data.content,
    //       status: "success",
    //       attachments: data.attachments?.length
    //         ? {
    //             createMany: {
    //               data: data.attachments.map((a) => ({
    //                 fileName: a.name,
    //                 fileType: a.type,
    //                 fileUrl: a.url,
    //                 thumbnailUrl: a.thumbnail,
    //                 fileMimeType: getAttachmentMimeType({
    //                   mimeType: a.mimeType,
    //                   fileType: a.type,
    //                   fileName: a.name,
    //                   fileUrl: a.url,
    //                   type: a.type,
    //                 }),
    //               })),
    //             },
    //           }
    //         : undefined,
    //     },
    //   })

    //   await db.conversation.update({
    //     where: { id: conversation.id },
    //     data: { lastActivityAt: new Date() },
    //   })
    //   return { message, isNewConversation }
    // } catch (error) {
    //   throw new Error(`Lỗi tạo tin nhắn: ${(error as Error).message}`)
    // }
  }

  async createOutbound(
    data: {
      externalConversationId: string
      linkedAccountId: string
      accountCustomerId: string
      externalId: string
      timestamp: number
      content?: string
      isGroupMessage: boolean
    },
    tx?: TransactionClient
  ) {
    const db = tx ?? this.prisma.client

    // const { conversation, isNew: isNewConversation } = await this.conversationService.getOrCreate(
    //   {
    //     externalId: data.externalConversationId,
    //     linkedAccountId: data.linkedAccountId,
    //     accountCustomerId: data.accountCustomerId,
    //     isGroupMessage: data.isGroupMessage,
    //   },
    //   tx
    // )

    // try {
    //   const message = await db.message.create({
    //     data: {
    //       conversationId: conversation.id,
    //       senderType: "agent",
    //       externalId: data.externalId,
    //       timestamp: new Date(data.timestamp),
    //       content: data.content,
    //       status: "success",
    //       attachments: data.attachments?.length
    //         ? {
    //             createMany: {
    //               data: data.attachments.map((a) => ({
    //                 fileName: a.name,
    //                 fileType: a.type,
    //                 fileUrl: a.url,
    //                 thumbnailUrl: a.thumbnail,
    //                 fileMimeType: getAttachmentMimeType({
    //                   mimeType: a.mimeType,
    //                   fileType: a.type,
    //                   fileName: a.name,
    //                   fileUrl: a.url,
    //                   type: a.type,
    //                 }),
    //               })),
    //             },
    //           }
    //         : undefined,
    //     },
    //   })

    //   await db.conversation.update({
    //     where: { id: conversation.id },
    //     data: { lastActivityAt: new Date() },
    //   })

    //   return { message, isNewConversation }
    // } catch (error) {
    //   throw new Error(`Lỗi tạo tin nhắn outbound: ${(error as Error).message}`)
    // }
  }

  async updateStatus(
    id: string,
    dataUpdate: {
      status: "processing" | "success" | "failed"
      externalId?: string
    }
  ) {
    return this.prisma.client.message.update({
      where: { id },
      data: { status: dataUpdate.status, externalId: dataUpdate.externalId },
    })
  }

  async delete(id: string) {
    const message = await this.prisma.client.message.findUnique({ where: { id } })
    if (!message) throw new NotFoundException("Tin nhắn không tồn tại")

    await this.prisma.client.message.delete({ where: { id } })
  }
}
