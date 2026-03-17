import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateLinkAccountDto } from "./dto/update-link-account.dto"

@Injectable()
export class LinkAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          OR: [
            { displayName: { contains: query.search, mode: "insensitive" as const } },
            { accountId: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.linkAccount.findMany({
        where,
        include: { linkedByUser: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.linkAccount.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const account = await this.prisma.client.linkAccount.findUnique({
      where: { id },
      include: { linkedByUser: { select: { id: true, name: true, avatarUrl: true } } },
    })

    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    return account
  }

  async update(id: string, dto: UpdateLinkAccountDto) {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    return this.prisma.client.linkAccount.update({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string) {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    await this.prisma.client.linkAccount.delete({ where: { id } })
  }
}
