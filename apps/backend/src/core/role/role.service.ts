import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../../database/prisma.service"
import { RedisService } from "../../redis/redis.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { CreateRoleDto } from "./dto/create-role.dto"
import { UpdateRoleDto } from "./dto/update-role.dto"

const PERMISSIONS_CACHE_PREFIX = "permissions:"
const ROLE_NAME_CACHE_PREFIX = "user_role:"
const SYSTEM_ROLE_NAME = "system"

@Injectable()
export class RoleService {
  private readonly cacheTtl: number

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {
    this.cacheTtl = this.configService.get<number>("REDIS_CACHE_TTL", 300)
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = {
      isDeleted: false,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { description: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.client.role.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take,
      }),
      this.prisma.client.role.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const role = await this.prisma.client.role.findFirst({
      where: { id, isDeleted: false },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    })

    if (!role) throw new NotFoundException("Role không tồn tại")

    return {
      ...role,
      rolePermissions: undefined,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    }
  }

  async create(dto: CreateRoleDto, createdBy: string) {
    const normalizedName = dto.name.trim()
    const normalizedDescription = dto.description?.trim()

    const existing = await this.prisma.client.role.findUnique({
      where: { name: normalizedName },
    })
    if (existing && !existing.isDeleted) throw new ConflictException("Role đã tồn tại")

    if (existing?.isDeleted) {
      const updated = await this.prisma.client.$transaction(async (tx) => {
        if (dto.permissionIds !== undefined) {
          await tx.rolePermission.deleteMany({ where: { roleId: existing.id } })
          if (dto.permissionIds.length > 0) {
            await tx.rolePermission.createMany({
              data: dto.permissionIds.map((permissionId) => ({
                roleId: existing.id,
                permissionId,
              })),
            })
          }
        }

        return tx.role.update({
          where: { id: existing.id },
          data: {
            name: normalizedName,
            description: normalizedDescription,
            isDeleted: false,
            createdBy,
          },
          include: {
            rolePermissions: { include: { permission: true } },
          },
        })
      })

      return {
        ...updated,
        rolePermissions: undefined,
        permissions: updated.rolePermissions.map((rp) => rp.permission),
      }
    }

    const role = await this.prisma.client.role.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        createdBy,
        rolePermissions: dto.permissionIds?.length
          ? {
              createMany: {
                data: dto.permissionIds.map((permissionId) => ({ permissionId })),
              },
            }
          : undefined,
      },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    })

    return {
      ...role,
      rolePermissions: undefined,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    }
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.client.role.findFirst({ where: { id, isDeleted: false } })
    if (!role) throw new NotFoundException("Role không tồn tại")
    if (role.name === SYSTEM_ROLE_NAME) throw new ForbiddenException("Không thể chỉnh sửa role hệ thống")

    const nextName = dto.name?.trim()
    const nextDescription = dto.description?.trim()

    if (nextName && nextName !== role.name) {
      const existing = await this.prisma.client.role.findUnique({
        where: { name: nextName },
      })
      if (existing && !existing.isDeleted) throw new ConflictException("Role đã tồn tại")
    }

    const updated = await this.prisma.client.$transaction(async (tx) => {
      if (dto.permissionIds !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } })
        if (dto.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: dto.permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          })
        }
      }

      return tx.role.update({
        where: { id },
        data: {
          ...(nextName !== undefined ? { name: nextName } : {}),
          ...(nextDescription !== undefined ? { description: nextDescription } : {}),
        },
        include: {
          rolePermissions: { include: { permission: true } },
        },
      })
    })

    await this.invalidateCacheByRoleId(id)

    return {
      ...updated,
      rolePermissions: undefined,
      permissions: updated.rolePermissions.map((rp) => rp.permission),
    }
  }

  async delete(id: string) {
    const role = await this.prisma.client.role.findFirst({ where: { id, isDeleted: false } })
    if (!role) throw new NotFoundException("Role không tồn tại")
    if (role.name === SYSTEM_ROLE_NAME) throw new ForbiddenException("Không thể xóa role hệ thống")

    const linkedUsers = await this.prisma.client.user.count({ where: { roleId: id } })
    if (linkedUsers > 0) throw new ConflictException("Không thể xóa role đang được gán cho người dùng")

    await this.invalidateCacheByRoleId(id)
    await this.prisma.client.role.update({
      where: { id },
      data: { isDeleted: true },
    })
  }

  // ─── Cache dùng chung (PermissionsGuard, SocketGateway) ──

  async getUserPermissions(userId: string): Promise<Set<string> | null> {
    const cacheKey = `${PERMISSIONS_CACHE_PREFIX}${userId}`

    const cached = await this.redisService.get<string[]>(cacheKey)
    if (cached) return new Set(cached)

    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      omit: { password: true },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    })
    if (!user?.role?.rolePermissions) return null

    const codes = user.role.rolePermissions.map((rp) => rp.permission.code)
    await this.redisService.set(cacheKey, codes, this.cacheTtl)

    return new Set(codes)
  }

  async getUserRoleName(userId: string): Promise<string | null> {
    const cacheKey = `${ROLE_NAME_CACHE_PREFIX}${userId}`

    const cached = await this.redisService.get<string>(cacheKey)
    if (cached) return cached

    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    })
    const roleName = user?.role?.name ?? null

    if (roleName) {
      await this.redisService.set(cacheKey, roleName, this.cacheTtl)
    }

    return roleName
  }

  async invalidateCacheByRoleId(roleId: string) {
    const users = await this.prisma.client.user.findMany({
      where: { roleId },
      select: { id: true },
    })

    if (users.length > 0) {
      await this.redisService.del(
        ...users.flatMap((u) => [`${PERMISSIONS_CACHE_PREFIX}${u.id}`, `${ROLE_NAME_CACHE_PREFIX}${u.id}`])
      )
    }
  }
}
