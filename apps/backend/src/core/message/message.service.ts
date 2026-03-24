import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { EVENTS, type MessageCreatedEvent } from "@workspace/shared"
import type { Attachment } from "src/utils/types"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { ConversationService } from "../conversation/conversation.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { UpdateMessageDto } from "./dto/update-message.dto"

import { MESSAGE_INCLUDE } from "./message.include"

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

  async create(dto: CreateMessageDto, userId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: dto.conversationId },
      include: { linkedAccount: true },
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")
    if (!conversation.linkedAccount) throw new NotFoundException("Tài khoản liên kết không tồn tại")

    const message = await this.prisma.client.message.create({
      data: {
        conversationId: dto.conversationId,
        senderType: "agent",
        userId,
        isRead: true,
        timestamp: new Date(),
        content: dto.content,
        status: "processing",
        attachments: dto.attachments?.length ? { createMany: { data: dto.attachments } } : undefined,
      },
    })

    await this.prisma.client.conversation.update({
      where: { id: dto.conversationId },
      data: { lastActivityAt: new Date() },
    })

    this.eventEmitter.emit(EVENTS.MESSAGE_CREATED, {
      messageId: message.id,
      linkedAccount: conversation.linkedAccount,
    } satisfies MessageCreatedEvent)

    return message
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
      conversationName?: string
      content?: string
      attachments?: Attachment[]
      isGroupMessage: boolean
    },
    tx?: TransactionClient
  ) {
    const db = tx ?? this.prisma.client

    const conversation = await this.conversationService.getOrCreate(
      {
        externalId: data.externalConversationId,
        linkedAccountId: data.linkedAccountId,
        accountCustomerId: data.accountCustomerId,
        isGroupMessage: data.isGroupMessage,
        name: data.conversationName,
      },
      tx
    )
    try {
      const message = await db.message.create({
        data: {
          conversationId: conversation.id,
          senderType: "customer",
          accountCustomerId: data.accountCustomerId,
          externalId: data.externalId,
          timestamp: new Date(data.timestamp),
          content: data.content,
          status: "success",
          attachments: data.attachments?.length
            ? {
                createMany: {
                  data: data.attachments.map((a) => ({
                    fileName: a.name,
                    fileType: a.type,
                    fileUrl: a.url,
                    thumbnailUrl: a.thumbnail,
                    fileMimeType: a.mimeType,
                  })),
                },
              }
            : undefined,
        },
      })

      await db.conversation.update({
        where: { id: conversation.id },
        data: { lastActivityAt: new Date() },
      })
      return message
    } catch (error) {
      throw new Error(`Lỗi tạo tin nhắn: ${(error as Error).message}`)
    }
  }

  async createOutbound(
    data: {
      externalConversationId: string
      linkedAccountId: string
      accountCustomerId: string
      externalId: string
      timestamp: number
      content?: string
      attachments?: Attachment[]
      isGroupMessage: boolean
    },
    tx?: TransactionClient
  ) {
    const db = tx ?? this.prisma.client

    const conversation = await this.conversationService.getOrCreate(
      {
        externalId: data.externalConversationId,
        linkedAccountId: data.linkedAccountId,
        accountCustomerId: data.accountCustomerId,
        isGroupMessage: data.isGroupMessage,
      },
      tx
    )

    try {
      const message = await db.message.create({
        data: {
          conversationId: conversation.id,
          senderType: "agent",
          externalId: data.externalId,
          timestamp: new Date(data.timestamp),
          content: data.content,
          status: "success",
          attachments: data.attachments?.length
            ? {
                createMany: {
                  data: data.attachments.map((a) => ({
                    fileName: a.name,
                    fileType: a.type,
                    fileUrl: a.url,
                    thumbnailUrl: a.thumbnail,
                    fileMimeType: a.mimeType,
                  })),
                },
              }
            : undefined,
        },
      })

      await db.conversation.update({
        where: { id: conversation.id },
        data: { lastActivityAt: new Date() },
      })

      return message
    } catch (error) {
      throw new Error(`Lỗi tạo tin nhắn outbound: ${(error as Error).message}`)
    }
  }

  async updateStatus(id: string, status: "processing" | "success" | "failed") {
    return this.prisma.client.message.update({
      where: { id },
      data: { status },
    })
  }

  async delete(id: string) {
    const message = await this.prisma.client.message.findUnique({ where: { id } })
    if (!message) throw new NotFoundException("Tin nhắn không tồn tại")

    await this.prisma.client.message.delete({ where: { id } })
  }
}
