import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import { RedisService } from "../../redis"
import { CreateRoleDto } from "./dto/create-role.dto"
import { UpdateRoleDto } from "./dto/update-role.dto"

const PERMISSIONS_CACHE_PREFIX = "permissions:"
const SYSTEM_ROLE_NAME = "system"

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async findAll() {
    const roles = await this.prisma.client.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return roles.map((role) => ({
      ...role,
      rolePermissions: undefined,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    }))
  }

  async findById(id: string) {
    const role = await this.prisma.client.role.findUnique({
      where: { id },
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

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.client.role.findUnique({
      where: { name: dto.name },
    })
    if (existing) throw new ConflictException("Role đã tồn tại")

    const role = await this.prisma.client.role.create({
      data: {
        name: dto.name,
        description: dto.description,
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
    const role = await this.prisma.client.role.findUnique({ where: { id } })
    if (!role) throw new NotFoundException("Role không tồn tại")
    if (role.name === SYSTEM_ROLE_NAME) throw new ForbiddenException("Không thể chỉnh sửa role hệ thống")

    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.client.role.findUnique({
        where: { name: dto.name },
      })
      if (existing) throw new ConflictException("Role đã tồn tại")
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
          name: dto.name,
          description: dto.description,
        },
        include: {
          rolePermissions: { include: { permission: true } },
        },
      })
    })

    await this.invalidatePermissionsCacheByRoleId(id)

    return {
      ...updated,
      rolePermissions: undefined,
      permissions: updated.rolePermissions.map((rp) => rp.permission),
    }
  }

  async delete(id: string) {
    const role = await this.prisma.client.role.findUnique({ where: { id } })
    if (!role) throw new NotFoundException("Role không tồn tại")
    if (role.name === SYSTEM_ROLE_NAME) throw new ForbiddenException("Không thể xóa role hệ thống")

    await this.invalidatePermissionsCacheByRoleId(id)
    await this.prisma.client.role.delete({ where: { id } })
  }

  private async invalidatePermissionsCacheByRoleId(roleId: string) {
    const users = await this.prisma.client.user.findMany({
      where: { roleId },
      select: { id: true },
    })

    if (users.length > 0) {
      await this.redisService.del(
        ...users.map((u) => `${PERMISSIONS_CACHE_PREFIX}${u.id}`)
      )
    }
  }
}
