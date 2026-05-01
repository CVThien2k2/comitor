import { Injectable, NotFoundException } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PrismaService } from "../../database/prisma.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { MessageCursorQueryDto } from "./dto/message-cursor-query.dto"
import { UpdateMessageDto } from "./dto/update-message.dto"

import { Prisma } from "@workspace/database"
import { MESSAGE_INCLUDE } from "./include"
 
 

@Injectable()
export class MessageService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}
 
  async findByConversationId(conversationId: string, query: MessageCursorQueryDto) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const limit = query.limit ?? 30
    const cursorTime = query.cursorTime ? new Date(query.cursorTime) : null
    const cursorId = query.cursorId

    let cursorCondition: Prisma.MessageWhereInput | undefined = undefined
    if (cursorTime && cursorId) {
      cursorCondition = {
        OR: [
          { timestamp: { lt: cursorTime } },
          { AND: [{ timestamp: cursorTime }, { id: { lt: cursorId } }] },
        ],
      }
    }

    const where: Prisma.MessageWhereInput = { conversationId, ...(cursorCondition ?? {}) }
    const orderBy: Prisma.MessageOrderByWithRelationInput[] = [
      { timestamp: "desc" },
      { id: "desc" },
    ]

    const rawItems = await this.prisma.client.message.findMany({
      where,
      include: MESSAGE_INCLUDE,
      orderBy,
      take: limit + 1,
    })

    const hasMore = rawItems.length > limit
    const sliced = hasMore ? rawItems.slice(0, limit) : rawItems
    const items = [...sliced].reverse()
    const tail = sliced[sliced.length - 1]

    return {
      items,
      meta: {
        limit,
        hasMore,
        nextCursor: tail ? { time: tail.timestamp.toISOString(), id: tail.id } : null,
      },
    }
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


    const messages = await this.prisma.client.$transaction(async (tx) => {
      const createdMessageIds: string[] = []
 
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
