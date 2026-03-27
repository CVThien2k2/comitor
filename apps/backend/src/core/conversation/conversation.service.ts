import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateConversationDto } from "./dto/update-conversation.dto"
import { MESSAGE_INCLUDE } from "../message/message.include"
import { ZaloPersonalService } from "src/platform/zalo_personal/zalo_personal.service"

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zaloPersonalService: ZaloPersonalService
  ) {}

  async countUnreadConversations() {
    return this.prisma.client.conversation.count({
      where: {
        messages: {
          some: { isRead: false },
        },
      },
    })
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = {
      ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
      ...(query.unread ? { messages: { some: { isRead: false } } } : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.client.conversation.findMany({
        where,
        include: {
          linkedAccount: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: MESSAGE_INCLUDE,
          },
          _count: { select: { messages: { where: { isRead: false } } } },
        },
        orderBy: [{ lastActivityAt: "desc" }, { id: "asc" }],
        skip,
        take,
      }),
      this.prisma.client.conversation.count({ where }),
    ])

    const mapped = items.map(({ _count, ...conv }) => ({
      ...conv,
      unreadCount: _count.messages,
    }))

    return paginatedResponse(mapped, total, page, limit)
  }

  async findById(id: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id },
      include: {
        linkedAccount: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: MESSAGE_INCLUDE,
        },
        _count: { select: { messages: { where: { isRead: false } } } },
      },
    })

    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const { _count, ...conv } = conversation
    return {
      ...conv,
      unreadCount: _count.messages,
    }
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
      include: {
        linkedAccount: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: MESSAGE_INCLUDE,
        },
        _count: { select: { messages: { where: { isRead: false } } } },
      },
    })

    const { _count, ...conv } = conversation
    return {
      ...conv,
      unreadCount: _count.messages,
    }
  }

  async markAsRead(conversationId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")

    const { count } = await this.prisma.client.message.updateMany({
      where: { conversationId, isRead: false },
      data: { isRead: true },
    })

    return { updatedMessages: count }
  }

  async getOrCreate(
    data: {
      externalId: string
      linkedAccountId: string
      accountCustomerId: string
      isGroupMessage?: boolean
    },
    tx?: TransactionClient
  ) {
    try {
      const db = tx ?? this.prisma.client

      const existing = await db.conversation.findFirst({
        where: { externalId: data.externalId, linkedAccountId: data.linkedAccountId },
      })

      if (existing) {
        const existingMember = await db.conversationCustomer.findFirst({
          where: {
            conversationId: existing.id,
            accountCustomerId: data.accountCustomerId,
          },
        })

        if (!existingMember) {
          await db.conversationCustomer.create({
            data: {
              conversationId: existing.id,
              accountCustomerId: data.accountCustomerId,
            },
          })
        }

        return { conversation: existing, isNew: false }
      }

      const accountCustomer = await db.accountCustomer.findFirst({
        where: { id: data.accountCustomerId },
        include: { goldenProfile: true },
      })
      let conversationName, conversationAvatarUrl
      if (!data.isGroupMessage) {
        conversationName = accountCustomer?.goldenProfile.fullName || "Khách hàng"
        conversationAvatarUrl = accountCustomer?.avatarUrl || null
      } else {
        const { name, avatarUrl } = await this.zaloPersonalService.getGroupConversationName(
          data.externalId,
          data.linkedAccountId
        )
        conversationName = name
        conversationAvatarUrl = avatarUrl
      }
      const conversation = await db.conversation.create({
        data: {
          externalId: data.externalId,
          linkedAccountId: data.linkedAccountId,
          accountCustomerId: data.accountCustomerId,
          name: conversationName || "Nhóm hội thoại",
          type: data.isGroupMessage ? "group" : "personal",
          avatarUrl: conversationAvatarUrl,
        },
      })

      await db.conversationCustomer.create({
        data: {
          conversationId: conversation.id,
          accountCustomerId: data.accountCustomerId,
        },
      })

      return { conversation, isNew: true }
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
