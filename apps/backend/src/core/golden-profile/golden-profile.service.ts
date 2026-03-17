import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateGoldenProfileDto } from "./dto/update-golden-profile.dto"

@Injectable()
export class GoldenProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: "insensitive" as const } },
            { primaryPhone: { contains: query.search, mode: "insensitive" as const } },
            { primaryEmail: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.goldenProfile.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      this.prisma.client.goldenProfile.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const profile = await this.prisma.client.goldenProfile.findUnique({
      where: { id },
      include: { accountCustomers: { include: { linkedAccount: { select: { provider: true, displayName: true } } } } },
    })

    if (!profile) throw new NotFoundException("Hồ sơ khách hàng không tồn tại")

    return profile
  }

  async update(id: string, dto: UpdateGoldenProfileDto) {
    const profile = await this.prisma.client.goldenProfile.findUnique({ where: { id } })
    if (!profile) throw new NotFoundException("Hồ sơ khách hàng không tồn tại")

    return this.prisma.client.goldenProfile.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender as any,
        memberTier: dto.memberTier as any,
        customerType: dto.customerType as any,
        journeyState: dto.journeyState as any,
      },
    })
  }

  async delete(id: string) {
    const profile = await this.prisma.client.goldenProfile.findUnique({ where: { id } })
    if (!profile) throw new NotFoundException("Hồ sơ khách hàng không tồn tại")

    await this.prisma.client.goldenProfile.delete({ where: { id } })
  }
}
