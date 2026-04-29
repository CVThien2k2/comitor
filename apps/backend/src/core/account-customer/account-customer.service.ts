import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { LinkAccount } from "@workspace/database"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { PrismaService, type TransactionClient } from "../../database/prisma.service"
import { ProfileFetcherRegistry } from "../../platform/profile-fetchers/profile-fetcher.registry"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateAccountCustomerDto } from "./dto/update-account-customer.dto"

function normalizeDateOfBirthForDb(value?: string): Date | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== trimmed ? undefined : date
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

@Injectable()
export class AccountCustomerService {
  private readonly logger = new Logger(AccountCustomerService.name)
  constructor(
    private readonly prisma: PrismaService,
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
    //Nếu tài khoản khách hàng đã tồn tại, trả về tài khoản khách hàng đó
    const existing = await db.accountCustomer.findFirst({
      where: { accountId: data.accountId, linkedAccountId: data.linkedAccount.id },
    })
    if (existing) return existing

    //Lấy thông tin người dùng để tạo hoặc cập nhật hồ sơ khách hàng
    const fetcher = this.profileFetcherRegistry.get(data.linkedAccount.provider)
    if (!fetcher) throw new Error(`Không hỗ trợ provider: ${data.linkedAccount.provider}`)

    const profile = await fetcher.getProfile(data.accountId, data.linkedAccount)

    if (!profile.fullName)
      throw new NotFoundException(
        "Không tìm thấy họ và tên người dùng trong thông tin người dùng" + JSON.stringify(profile)
      )

    try {
      const conditions: { primaryEmail?: string; primaryPhone?: string }[] = []
      if (profile.primaryEmail) conditions.push({ primaryEmail: profile.primaryEmail })
      if (profile.primaryPhone) conditions.push({ primaryPhone: profile.primaryPhone })

      const existingGoldenProfile = conditions.length
        ? await db.goldenProfile.findFirst({
            where: { OR: conditions },
          })
        : null

      const goldenProfile =
        existingGoldenProfile ??
        (await db.goldenProfile.create({
          data: {
            linkedAccountId: data.linkedAccount.id,
            fullName: profile.fullName,
            gender: profile.gender,
            dateOfBirth: normalizeDateOfBirthForDb(profile.dateOfBirth),
            primaryPhone: profile.primaryPhone,
            primaryEmail: profile.primaryEmail,
          },
        }))

      if (!goldenProfile) throw new NotFoundException("Không tìm thấy hồ sơ khách hàng")

      return db.accountCustomer.create({
        data: {
          accountId: data.accountId,
          linkedAccountId: data.linkedAccount.id,
          name: profile.fullName,
          goldenProfileId: goldenProfile.id,
          avatarUrl: profile.avatarUrl,
          lastActivityAt: new Date(),
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
