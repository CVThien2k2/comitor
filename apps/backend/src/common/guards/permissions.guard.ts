import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Reflector } from "@nestjs/core"
import type { PermissionCode } from "@workspace/database"
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator"
import { UsersService } from "../../core/users/users.service"
import { RedisService } from "../../redis"

const PERMISSIONS_CACHE_PREFIX = "permissions:"

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly cacheTtl: number

  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private redisService: RedisService,
    private configService: ConfigService
  ) {
    this.cacheTtl = this.configService.get<number>("REDIS_CACHE_TTL", 300)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) return true

    const req = context.switchToHttp().getRequest()
    if (!req.user?.id) throw new ForbiddenException("Người dùng chưa được gán quyền nào")

    const userPermissions = await this.getUserPermissions(req.user.id)
    if (!userPermissions) {
      throw new ForbiddenException("Người dùng chưa được gán quyền nào")
    }

    if (userPermissions.has("*")) return true

    const hasAll = required.every((perm) => {
      if (userPermissions.has(perm)) return true
      const [resource] = perm.split(":")
      return userPermissions.has(`${resource}:*`)
    })

    if (!hasAll) {
      throw new ForbiddenException("Bạn không có đủ quyền để thực hiện hành động này")
    }

    return true
  }

  private async getUserPermissions(userId: string): Promise<Set<string> | null> {
    const cacheKey = `${PERMISSIONS_CACHE_PREFIX}${userId}`

    const cached = await this.redisService.get<string[]>(cacheKey)
    if (cached) return new Set(cached)

    const user = await this.usersService.findByIdWithRole(userId)
    if (!user?.role?.rolePermissions) return null

    const codes = user.role.rolePermissions.map((rp) => rp.permission.code)
    await this.redisService.set(cacheKey, codes, this.cacheTtl)

    return new Set(codes)
  }
}
