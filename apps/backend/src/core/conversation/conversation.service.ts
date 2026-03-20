import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateConversationDto } from "./dto/update-conversation.dto"

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}

    const [items, total] = await Promise.all([
      this.prisma.client.conversation.findMany({
        where,
        include: {
          linkedAccount: { select: { provider: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              content: true,
              senderType: true,
              createdAt: true,
              user: { select: { id: true, name: true, avatarUrl: true } },
              accountCustomer: {
                select: {
                  id: true,
                  avatarUrl: true,
                  goldenProfile: { select: { fullName: true } },
                },
              },
            },
          },
          _count: { select: { messages: { where: { isRead: false } } } },
        },
        orderBy: { lastActivityAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.conversation.count({ where }),
    ])

    const mapped = items.map(({ messages, _count, ...conv }) => ({
      ...conv,
      lastMessage: messages[0] ?? null,
      unreadCount: _count.messages,
    }))

    return paginatedResponse(mapped, total, page, limit)
  }

  async findById(id: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id },
      include: {
        linkedAccount: true,
        conversationCustomers: {
          include: { accountCustomer: true },
        },
      },
    })

    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    return conversation
  }

  async update(id: string, dto: UpdateConversationDto) {
    const conversation = await this.prisma.client.conversation.findUnique({ where: { id } })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    return this.prisma.client.conversation.update({
      where: { id },
      data: {
        name: dto.name,
        tag: dto.tag as any,
        journeyState: dto.journeyState as any,
      },
    })
  }

  async getOrCreate(
    data: { externalId: string; linkedAccountId: string; accountCustomerId: string; isGroupMessage?: boolean, name?: string },
    tx?: TransactionClient
  ) {
    try {
      const db = tx ?? this.prisma.client

      const existing = await db.conversation.findFirst({
        where: { externalId: data.externalId, linkedAccountId: data.linkedAccountId },
      })

      if (existing) return existing

      const conversation = await db.conversation.create({
        data: {
          externalId: data.externalId,
          linkedAccountId: data.linkedAccountId,
          accountCustomerId: data.accountCustomerId,
          name: data.name,
          type: data.isGroupMessage ? "group" : "personal",
        },
      })

      await db.conversationCustomer.create({
        data: {
          conversationId: conversation.id,
          accountCustomerId: data.accountCustomerId,
        },
      })

      return conversation
    } catch (error) {
      throw new Error(`Lỗi tạo cuộc hội thoại: ${(error as Error).message}`)
    }
  }

  async delete(id: string) {
    const conversation = await this.prisma.client.conversation.findUnique({ where: { id } })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    await this.prisma.client.conversation.delete({ where: { id } })
  }
}
