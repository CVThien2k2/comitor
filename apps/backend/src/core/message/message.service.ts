import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PrismaService } from "../../database/prisma.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { MessageCursorQueryDto } from "./dto/message-cursor-query.dto"
import { UpdateMessageDto } from "./dto/update-message.dto"

import { MessageType, Prisma } from "@workspace/database"
import { CONVERSATION_INCLUDE, MESSAGE_INCLUDE } from "./include"
import { EMIT_EVENTS } from "../../events/emit-events"
import type { ContentMessage } from "../../utils/types/message"



@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  private resolveMessageType(content: ContentMessage): MessageType {
    const type = content.type?.toLowerCase()
    if (type === "text") return MessageType.text
    if (type === "image") return MessageType.image
    if (type === "file") return MessageType.file
    if (type === "video") return MessageType.video
    if (type === "audio") return MessageType.audio
    if (type === "sticker") return MessageType.sticker
    if (type === "gif") return MessageType.gif
    if (type === "recommended") return MessageType.recommended
    if (type === "location") return MessageType.location
    if (type === "template") return MessageType.template
    if (content.text?.trim()) return MessageType.text
    return MessageType.file
  }

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

  async findConversationRealtime(conversationId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
      include: CONVERSATION_INCLUDE,
    })
    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")
    return conversation
  }

  async create(dto: CreateMessageDto, userId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: dto.conversationId },
      include: { linkedAccount: true },
    })

    if (!conversation) throw new NotFoundException("Cuộc hội thoại không tồn tại")
    if (!conversation.linkedAccount || conversation.linkedAccount.status == "inactive") throw new NotFoundException("Tài khoản liên kết không tồn tại")

    const now = new Date()
    const createdMessage = await this.prisma.client.message.create({
      data: {
        conversationId: dto.conversationId,
        senderType: "agent",
        content: dto.content as Prisma.InputJsonValue,
        status: "processing",
        type: this.resolveMessageType(dto.content),
        createdBy: userId,
        timestamp: now,
      },
    })

    await this.prisma.client.$transaction([
      this.prisma.client.conversation.update({
        where: { id: dto.conversationId },
        data: { lastActivityAt: now },
      }),
      this.prisma.client.conversation.updateMany({
        where: { id: dto.conversationId, status: "closed" },
        data: { status: "pending" },
      }),
    ])

    const fullMessage = await this.prisma.client.message.findUnique({
      where: { id: createdMessage.id },
      include: MESSAGE_INCLUDE,
    })
    if (!fullMessage) throw new NotFoundException("Tin nhắn không tồn tại")

    this.eventEmitter.emit(EMIT_EVENTS.MESSAGE_OUTBOUND_CREATED, {
      message: createdMessage,
      linkedAccount: conversation.linkedAccount,
    })

    return fullMessage
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
