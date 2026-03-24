import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
            { username: { contains: query.search, mode: "insensitive" as const } },
            { phone: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.user.findMany({
        where,
        omit: { password: true },
        include: { role: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.user.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findByUsername(username: string) {
    return this.prisma.client.user.findUnique({
      where: { username },
      omit: { password: true },
    })
  }

  async findByUsernameWithPassword(username: string) {
    return this.prisma.client.user.findUnique({ where: { username } })
  }

  async findById(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
      omit: { password: true },
    })
  }

  async findByIdDetail(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      omit: { password: true },
      include: { role: { select: { id: true, name: true, description: true } } },
    })

    if (!user) throw new NotFoundException("Người dùng không tồn tại")

    return user
  }

  async findByIdWithRole(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
      omit: { password: true },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    })
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.client.user.findUnique({ where: { id } })
  }

  async create(dto: CreateUserDto) {
    const existingUsername = await this.prisma.client.user.findUnique({ where: { username: dto.username } })
    if (existingUsername) throw new ConflictException("Tên đăng nhập đã tồn tại")

    const existingEmail = await this.prisma.client.user.findUnique({ where: { email: dto.email } })
    if (existingEmail) throw new ConflictException("Email đã tồn tại")

    if (dto.phone) {
      const existingPhone = await this.prisma.client.user.findUnique({ where: { phone: dto.phone } })
      if (existingPhone) throw new ConflictException("Số điện thoại đã tồn tại")
    }

    const role = await this.prisma.client.role.findUnique({ where: { id: dto.roleId }, select: { id: true } })
    if (!role) throw new NotFoundException("Vai trò không tồn tại")

    const hashed = await bcrypt.hash(dto.password, 10)

    return this.prisma.client.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        username: dto.username,
        password: hashed,
        phone: dto.phone,
        roleId: dto.roleId,
      },
      omit: { password: true },
    })
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.client.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException("Người dùng không tồn tại")

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.client.user.findUnique({ where: { email: dto.email } })
      if (existing) throw new ConflictException("Email đã tồn tại")
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.prisma.client.user.findUnique({ where: { phone: dto.phone } })
      if (existing) throw new ConflictException("Số điện thoại đã tồn tại")
    }

    return this.prisma.client.user.update({
      where: { id },
      data: dto,
      omit: { password: true },
    })
  }

  async delete(id: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException("Người dùng không tồn tại")

    await this.prisma.client.user.delete({ where: { id } })
  }

  async updatePassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10)
    return this.prisma.client.user.update({
      where: { id },
      data: { password: hashed },
      omit: { password: true },
    })
  }

  async setOnlineStatus(id: string, isOnline: boolean) {
    return this.prisma.client.user.update({
      where: { id },
      data: { isOnline },
      omit: { password: true },
    })
  }
}
