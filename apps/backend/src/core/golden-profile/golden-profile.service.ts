import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { GoldenProfile } from "@workspace/database"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateGoldenProfileDto } from "./dto/update-golden-profile.dto"
import { ProfileFetcherRegistry } from "../../platform/profile-fetchers/profile-fetcher.registry"

@Injectable()
export class GoldenProfileService {
  private readonly logger = new Logger(GoldenProfileService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileFetcherRegistry: ProfileFetcherRegistry
  ) {}

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

  async getOrCreateFromProfile(profileData: Partial<GoldenProfile>, tx?: TransactionClient) {
    try {
      const db = tx ?? this.prisma.client
      const { id: _externalId, ...createData } = profileData

      // Nếu có email hoặc phone, tìm hồ sơ khách hàng theo email hoặc phone để merge profile
      if (profileData.primaryEmail || profileData.primaryPhone) {
        const conditions: { primaryEmail?: string; primaryPhone?: string }[] = []
        if (profileData.primaryEmail) conditions.push({ primaryEmail: profileData.primaryEmail })
        if (profileData.primaryPhone) conditions.push({ primaryPhone: profileData.primaryPhone })

        const existing = await db.goldenProfile.findFirst({
          where: { OR: conditions },
        })
        // Nếu tìm thấy hồ sơ khách hàng, trả về hồ sơ khách hàng đó
        if (existing) return existing
      }

      // Nếu không tìm thấy hồ sơ khách hàng, tạo mới
      return await db.goldenProfile.create({
        data: createData,
      })
    } catch (error) {
      throw new Error(`Lỗi tạo hồ sơ khách hàng: ${(error as Error).message}`)
    }
  }

  async delete(id: string) {
    const profile = await this.prisma.client.goldenProfile.findUnique({ where: { id } })
    if (!profile) throw new NotFoundException("Hồ sơ khách hàng không tồn tại")

    await this.prisma.client.goldenProfile.delete({ where: { id } })
  }
}
