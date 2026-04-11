import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateAccountCustomerDto } from "./dto/update-account-customer.dto"
import { GoldenProfileService } from "../golden-profile/golden-profile.service"
import { ProfileFetcherRegistry } from "../../platform/profile-fetchers/profile-fetcher.registry"
import type { ProfileResult } from "src/platform/profile-fetchers/profile-fetcher.interface"

const FALLBACK_CUSTOMER_NAME = "Khách hàng"

@Injectable()
export class AccountCustomerService {
  private readonly logger = new Logger(AccountCustomerService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly goldenProfileService: GoldenProfileService,
    private readonly profileFetcherRegistry: ProfileFetcherRegistry
  ) {}

  private async fetchProfile(data: { accountId: string; linkedAccount: LinkAccount }): Promise<ProfileResult> {
    const fetcher = this.profileFetcherRegistry.get(data.linkedAccount.provider)
    if (!fetcher) throw new NotFoundException(`Không hỗ trợ provider: ${data.linkedAccount.provider}`)

    try {
      return await fetcher.getProfile(data.accountId, data.linkedAccount)
    } catch (error) {
      throw new Error(
        `Lỗi lấy dữ liệu người dùng từ ${data.linkedAccount.provider} (userId=${data.accountId}): ${(error as Error).message}`
      )
    }
  }

  private async createAccountCustomerFromProfile(
    data: { accountId: string; linkedAccount: LinkAccount },
    profileResult: ProfileResult,
    tx?: TransactionClient
  ) {
    const db = tx ?? this.prisma.client
    const { profile: profileData, avatarUrl } = profileResult
    const goldenProfile = await this.goldenProfileService.getOrCreateFromProfile(profileData, tx)
    const updateData = {
      ...(profileData.fullName ? { name: profileData.fullName } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
      goldenProfileId: goldenProfile.id,
    }

    try {
      return await db.accountCustomer.upsert({
        where: {
          unique_account_customer: {
            accountId: data.accountId,
            linkedAccountId: data.linkedAccount.id,
          },
        },
        create: {
          accountId: data.accountId,
          linkedAccountId: data.linkedAccount.id,
          goldenProfileId: goldenProfile.id,
          name: profileData.fullName,
          avatarUrl,
        },
        update: updateData,
      })
    } catch (error) {
      throw new Error(`Lỗi tạo tài khoản khách hàng: ${(error as Error).message}`)
    }
  }

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

    const profileResult = await this.fetchProfile(data)
    return this.createAccountCustomerFromProfile(data, profileResult, tx)
  }

  async getOrCreateAndSyncProfile(data: { accountId: string; linkedAccount: LinkAccount }, tx?: TransactionClient) {
    const db = tx ?? this.prisma.client
    const existing = await db.accountCustomer.findFirst({
      where: { accountId: data.accountId, linkedAccountId: data.linkedAccount.id },
      include: {
        goldenProfile: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    })

    const profileResult = await this.fetchProfile(data)
    const { profile: profileData, avatarUrl } = profileResult

    if (!existing) {
      return this.createAccountCustomerFromProfile(data, profileResult, tx)
    }

    const goldenProfileUpdateData = {
      ...(profileData.fullName ? { fullName: profileData.fullName } : {}),
      ...(profileData.gender ? { gender: profileData.gender } : {}),
      ...(profileData.dateOfBirth ? { dateOfBirth: profileData.dateOfBirth } : {}),
      ...(profileData.primaryPhone ? { primaryPhone: profileData.primaryPhone } : {}),
      ...(profileData.primaryEmail ? { primaryEmail: profileData.primaryEmail } : {}),
      ...(profileData.address ? { address: profileData.address } : {}),
      ...(profileData.city ? { city: profileData.city } : {}),
    }

    if (Object.keys(goldenProfileUpdateData).length > 0) {
      await db.goldenProfile.update({
        where: { id: existing.goldenProfile.id },
        data: goldenProfileUpdateData,
      })
    }

    const accountCustomerUpdateData = {
      ...(profileData.fullName ? { name: profileData.fullName } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    }

    const accountCustomer =
      Object.keys(accountCustomerUpdateData).length > 0
        ? await db.accountCustomer.update({
            where: { id: existing.id },
            data: accountCustomerUpdateData,
          })
        : existing

    if (avatarUrl) {
      await db.conversation.updateMany({
        where: {
          type: "personal",
          accountCustomerId: existing.id,
        },
        data: {
          avatarUrl,
        },
      })
    }

    if (profileData.fullName) {
      const previousNames = new Set<string>([FALLBACK_CUSTOMER_NAME])

      if (existing.name?.trim()) {
        previousNames.add(existing.name.trim())
      }

      if (existing.goldenProfile.fullName?.trim()) {
        previousNames.add(existing.goldenProfile.fullName.trim())
      }

      await db.conversation.updateMany({
        where: {
          type: "personal",
          accountCustomerId: existing.id,
          OR: [{ name: null }, { name: "" }, ...[...previousNames].map((name) => ({ name }))],
        },
        data: {
          name: profileData.fullName,
        },
      })
    }

    return accountCustomer
  }

  async delete(id: string) {
    const account = await this.prisma.client.accountCustomer.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Tài khoản khách không tồn tại")

    await this.prisma.client.accountCustomer.delete({ where: { id } })
  }
}
