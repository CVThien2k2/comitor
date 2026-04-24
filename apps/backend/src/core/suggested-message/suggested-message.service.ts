import { Injectable, NotFoundException } from "@nestjs/common"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { PrismaService } from "../../database/prisma.service"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { CreateSuggestedMessageDto } from "./dto/create-suggested-message.dto"
import { UpdateSuggestedMessageDto } from "./dto/update-sugggested-message.dto"

@Injectable()
export class SuggestedMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          OR: [
            { tag: { contains: query.search, mode: "insensitive" as const } },
            { message: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.suggestedMessage.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take,
      }),
      this.prisma.client.suggestedMessage.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const item = await this.prisma.client.suggestedMessage.findUnique({
      where: { id },
    })

    if (!item) throw new NotFoundException("Tin nhắn gợi ý không tồn tại")

    return item
  }

  async create(dto: CreateSuggestedMessageDto) {
    // return this.prisma.client.suggestedMessage.create({
    //   data: {
    //     tag: dto.tag.trim(),
    //     message: dto.message.trim(),
    //     images: dto.images ?? [],
    //   },
    // })
  }

  async update(id: string, dto: UpdateSuggestedMessageDto) {
    await this.findById(id)

    return this.prisma.client.suggestedMessage.update({
      where: { id },
      data: {
        ...(dto.tag !== undefined ? { tag: dto.tag.trim() } : {}),
        ...(dto.message !== undefined ? { message: dto.message.trim() } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
      },
    })
  }

  async delete(id: string) {
    await this.findById(id)
    await this.prisma.client.suggestedMessage.delete({ where: { id } })
  }
}
