import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateAccountCustomerDto } from "./dto/update-account-customer.dto"

@Injectable()
export class AccountCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          goldenProfile: {
            OR: [
              { fullName: { contains: query.search, mode: "insensitive" as const } },
              { primaryPhone: { contains: query.search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.accountCustomer.findMany({
        where,
        include: {
          goldenProfile: { select: { fullName: true, primaryPhone: true, primaryEmail: true } },
          linkedAccount: { select: { provider: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.accountCustomer.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const account = await this.prisma.client.accountCustomer.findUnique({
      where: { id },
      include: {
        goldenProfile: true,
        linkedAccount: { select: { id: true, provider: true, displayName: true, avatarUrl: true } },
      },
    })

    if (!account) throw new NotFoundException("Tài khoản khách không tồn tại")

    return account
  }

  async update(id: string, dto: UpdateAccountCustomerDto) {
    const account = await this.prisma.client.accountCustomer.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Tài khoản khách không tồn tại")

    return this.prisma.client.accountCustomer.update({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string) {
    const account = await this.prisma.client.accountCustomer.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Tài khoản khách không tồn tại")

    await this.prisma.client.accountCustomer.delete({ where: { id } })
  }
}
