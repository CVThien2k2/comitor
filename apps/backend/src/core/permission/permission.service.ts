import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          OR: [
            { code: { contains: query.search, mode: "insensitive" as const } },
            { description: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.permission.findMany({ where, orderBy: { code: "asc" }, skip, take }),
      this.prisma.client.permission.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async getPermissionByUserId(userId: string) {
    const permissions = await this.prisma.client.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            role: {
              users: {
                some: { id: userId },
              },
            },
          },
        },
      },
      select: { code: true },
      distinct: ["code"],
      orderBy: { code: "asc" },
    })

    return permissions.map((permission) => permission.code)
  }
}
