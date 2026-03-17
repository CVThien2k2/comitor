import { Injectable, NotFoundException } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { EVENTS, type MessageCreatedEvent } from "@workspace/shared"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { CreateMessageDto } from "./dto/create-message.dto"
import { UpdateMessageDto } from "./dto/update-message.dto"

const MESSAGE_INCLUDE = {
  attachments: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
  accountCustomer: {
    select: {
      id: true,
      avatarUrl: true,
      goldenProfile: { select: { fullName: true } },
    },
  },
} as const

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
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
        orderBy: { createdAt: "asc" },
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
      include: { linkedAccount: { select: { provider: true } } },
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const message = await this.prisma.client.message.create({
      data: {
        conversationId: dto.conversationId,
        senderType: "agent",
        userId,
        isRead: true,
        content: dto.content,
        status: "success",
        attachments: dto.attachments?.length ? { createMany: { data: dto.attachments } } : undefined,
      },
    })

    await this.prisma.client.conversation.update({
      where: { id: dto.conversationId },
      data: { lastActivityAt: new Date() },
    })

    this.eventEmitter.emit(EVENTS.MESSAGE_CREATED, {
      messageId: message.id,
      conversationId: message.conversationId,
      provider: conversation.linkedAccount.provider,
      senderType: message.senderType,
      userId,
      content: message.content,
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

  async delete(id: string) {
    const message = await this.prisma.client.message.findUnique({ where: { id } })
    if (!message) throw new NotFoundException("Tin nhắn không tồn tại")

    await this.prisma.client.message.delete({ where: { id } })
  }
}
