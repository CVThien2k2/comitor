import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { ConversationQueryDto } from "./dto/conversation-query.dto"
import { UpdateConversationDto } from "./dto/update-conversation.dto"
import { CONVERSATION_INCLUDE } from "../message/include"

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ConversationQueryDto, userId: string) {
    const limit = query.limit ?? 20
    const baseWhere = {
      ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
      ...(query.unread ? { isUnread: true } : {}),
      ...(query.myProcessing ? { processingBy: userId } : {}),
    }
    const cursorDate =
      query.cursorLastActivityAt && !Number.isNaN(new Date(query.cursorLastActivityAt).getTime())
        ? new Date(query.cursorLastActivityAt)
        : null

    const where =
      cursorDate && query.cursorId
        ? {
            ...baseWhere,
            OR: [
              { lastActivityAt: { lt: cursorDate } },
              {
                AND: [{ lastActivityAt: cursorDate }, { id: { gt: query.cursorId } }],
              },
            ],
          }
        : baseWhere

    const [items, total] = await Promise.all([
      this.prisma.client.conversation.findMany({
        where,
        include: CONVERSATION_INCLUDE,
        orderBy: [{ lastActivityAt: "desc" }, { id: "asc" }],
        take: limit + 1,
      }),
      this.prisma.client.conversation.count({ where: baseWhere }),
    ])

    const hasMore = items.length > limit
    const normalizedItems = hasMore ? items.slice(0, limit) : items
    const lastItem = normalizedItems[normalizedItems.length - 1]

    return {
      items: normalizedItems,
      meta: {
        limit,
        total,
        hasMore,
        nextCursor:
          hasMore && lastItem
            ? {
                lastActivityAt: lastItem.lastActivityAt.toISOString(),
                id: lastItem.id,
              }
            : null,
      },
    }
  }

  async findById(id: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id },
      include: CONVERSATION_INCLUDE,
    })

    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    return conversation
  }

  async update(id: string, dto: UpdateConversationDto) {
    const existing = await this.prisma.client.conversation.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const conversation = await this.prisma.client.conversation.update({
      where: { id },
      data: {
        name: dto.name,
        tag: dto.tag as any,
        journeyState: dto.journeyState as any,
      },
    })

    return { ...conversation, unreadCount: conversation.countUnreadMessages }
  }

  async markAsRead(conversationId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const latestMessage = await this.prisma.client.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      select: { id: true, isRead: true },
    })

    if (!latestMessage || latestMessage.isRead) {
      return { updatedMessages: 0 }
    }

    await this.prisma.client.message.update({
      where: { id: latestMessage.id },
      data: { isRead: true },
    })

    return { updatedMessages: 1 }
  }
}
