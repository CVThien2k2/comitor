import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { PermissionCode } from "@workspace/database"
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator"
import { UsersService } from "../../core/users/users.service"

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) return true

    const req = context.switchToHttp().getRequest()
    const user = await this.usersService.findByIdWithRole(req.user?.id)
    if (!user?.role?.rolePermissions) throw new ForbiddenException("No permissions assigned")

    const userPermissions = new Set<string>(user.role.rolePermissions.map((rp) => rp.permission.code))
    if (userPermissions.has("*")) return true

    const hasAll = required.every((perm) => {
      if (userPermissions.has(perm)) return true
      const [resource] = perm.split(":")
      return userPermissions.has(`${resource}:*`)
    })

    if (!hasAll) {
      throw new ForbiddenException("Insufficient permissions")
    }

    return true
  }
}
