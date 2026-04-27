import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { ChannelType } from "@workspace/database"
import { PrismaService } from "../../database/prisma.service"
import { paginate, paginatedResponse } from "../../utils/paginate"
import type { LinkAccountQueryDto } from "./dto/link-account-query.dto"
import { UpdateLinkAccountDto } from "./dto/update-link-account.dto"

@Injectable()
export class LinkAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LinkAccountQueryDto) {
    const { skip, take, page, limit, search } = paginate(query)
    const provider = query.provider

    const where = {
      isDeleted: false,
      ...(provider ? { provider } : {}),
      ...(search ? { OR: [{ displayName: { contains: search, mode: "insensitive" as const } }] } : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.client.linkAccount.findMany({
        where,
        omit: { credentials: true },
        include: { createdByUser: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.linkAccount.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async getStats() {
    const baseWhere = { isDeleted: false }

    const [totalCount, activeCount, providerRows] = await Promise.all([
      this.prisma.client.linkAccount.count({ where: baseWhere }),
      this.prisma.client.linkAccount.count({ where: { ...baseWhere, status: "active" } }),
      this.prisma.client.linkAccount.findMany({
        where: baseWhere,
        distinct: ["provider"],
        select: { provider: true },
      }),
    ])

    return {
      totalCount,
      activeCount,
      providerCount: providerRows.length,
    }
  }

  async create(data: {
    accountId: string
    provider: ChannelType
    displayName: string
    avatarUrl: string
    credentials: any
    createdBy: string
  }) {
    const existing = await this.prisma.client.linkAccount.findFirst({
      where: { accountId: data.accountId, provider: data.provider, isDeleted: false, status: "active" },
    })
    //Nếu tài khoản đã tồn tại, vẫn cần update thông tin mới để lưu token đã đăng nhập, tránh zalo-psn bị đá ở token cũ
    const linkAccount = await this.prisma.client.linkAccount.upsert({
      where: {
        unique_account_link: {
          accountId: data.accountId,
          provider: data.provider,
        },
      },
      create: { ...data, status: "active", isDeleted: false },
      update: { ...data, status: "active", isDeleted: false },
    })
    //Sau đó mới throw error nếu tài khoản đã tồn tại
    if (existing) throw new BadRequestException("Liên kết kênh đã tồn tại trong hệ thống")
    return linkAccount
  }

  async createMany(
    data: Array<{
      accountId: string
      provider: ChannelType
      displayName: string
      avatarUrl: string
      credentials: any
      createdBy: string
    }>
  ) {
    let createdAccounts = 0
    try {
      await this.prisma.client.$transaction(async (tx) => {
        const list: any[] = []
        for (const item of data) {
          const existing = await tx.linkAccount.findFirst({
            where: { accountId: item.accountId, provider: item.provider, isDeleted: false, status: "active" },
          })
          const linkAccount = await tx.linkAccount.upsert({
            where: {
              unique_account_link: {
                accountId: item.accountId,
                provider: item.provider,
              },
            },
            create: { ...item, status: "active", isDeleted: false },
            update: { ...item, status: "active", isDeleted: false },
          })

          if (!existing) createdAccounts++
          list.push(linkAccount)
        }
        return list
      })
    } catch {
      throw new BadRequestException("Có lỗi xảy ra khi tạo liên kết kênh")
    }
    //Kênh này đã được liên kết từ trước rồim vẫn update nhưng throw để thông báo
    if (createdAccounts == 0) throw new BadRequestException("Kênh này đã được liên kết từ trước rồi")
    return createdAccounts
  }

  //Lấy danh sách các account zalo cá nhân để khôi phục phiên
  async getZaloToConnect() {
    const accounts = await this.prisma.client.linkAccount.findMany({
      where: {
        provider: ChannelType.zalo_personal,
        isDeleted: false,
        status: "active",
      },
      select: {
        id: true,
        credentials: true,
        accountId: true,
      },
    })
    return accounts
  }

  //Hàm chuyển trang thái từ active sang inactive
  async updateStatus(id: string, status: "active" | "inactive") {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    return this.prisma.client.linkAccount.update({
      where: { id },
      data: { status },
    })
  }

  async findById(id: string) {
    const account = await this.prisma.client.linkAccount.findUnique({
      where: { id },
      include: { createdByUser: { select: { id: true, name: true, avatarUrl: true } } },
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

  async updateConnection(
    id: string,
    data: {
      status?: "active" | "inactive"
      displayName?: string | null
      avatarUrl?: string | null
      credentials?: any
    }
  ) {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    return this.prisma.client.linkAccount.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")
    if (account.status === "active") throw new BadRequestException("Không thể xóa liên kết kênh đang hoạt động")

    await this.prisma.client.linkAccount.update({
      where: { id },
      data: { isDeleted: true, status: "inactive" },
    })
  }
}
