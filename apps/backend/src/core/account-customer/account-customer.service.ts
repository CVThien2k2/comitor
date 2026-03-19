import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateAccountCustomerDto } from "./dto/update-account-customer.dto"
import { GoldenProfileService } from "../golden-profile/golden-profile.service"
import { ProfileFetcherRegistry } from "../../platform/profile-fetchers/profile-fetcher.registry"
import type { ProfileResult } from "src/platform/profile-fetchers/profile-fetcher.interface"

@Injectable()
export class AccountCustomerService {
  private readonly logger = new Logger(AccountCustomerService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly goldenProfileService: GoldenProfileService,
    private readonly profileFetcherRegistry: ProfileFetcherRegistry
  ) {}

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

  async getOrCreate(data: { accountId: string; linkedAccount: LinkAccount }, tx?: TransactionClient) {
    const db = tx ?? this.prisma.client

    const existing = await db.accountCustomer.findFirst({
      where: { accountId: data.accountId, linkedAccountId: data.linkedAccount.id },
    })

    if (existing) return existing

    // Chỉ fetch profile khi cần tạo mới account
    const fetcher = this.profileFetcherRegistry.get(data.linkedAccount.provider)
    if (!fetcher) throw new NotFoundException(`Không hỗ trợ provider: ${data.linkedAccount.provider}`)

    let profileResult: ProfileResult
    try {
      profileResult = await fetcher.getProfile(data.accountId, data.linkedAccount)
    } catch (error) {
      throw new Error(
        `Lỗi lấy dữ liệu người dùng từ ${data.linkedAccount.provider} (userId=${data.accountId}): ${(error as Error).message}`
      )
    }

    const { profile: profileData, avatarUrl } = profileResult

    const goldenProfile = await this.goldenProfileService.getOrCreateFromProfile(profileData, tx)
    try {
      return db.accountCustomer.create({
        data: {
          accountId: data.accountId,
          linkedAccountId: data.linkedAccount.id,
          goldenProfileId: goldenProfile.id,
          avatarUrl,
        },
      })
    } catch (error) {
      throw new Error(`Lỗi tạo tài khoản khách hàng: ${(error as Error).message}`)
    }
  }

  async delete(id: string) {
    const account = await this.prisma.client.accountCustomer.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Tài khoản khách không tồn tại")

    await this.prisma.client.accountCustomer.delete({ where: { id } })
  }
}
