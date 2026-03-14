import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { Permission } from "@workspace/shared"
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator"

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user?.role?.rolePermissions) throw new ForbiddenException("No permissions assigned")

    const userPermissions = new Set<string>(
      user.role.rolePermissions.map((rp: { permission: { code: string } }) => rp.permission.code)
    )

    // "*" → full access to everything
    if (userPermissions.has("*")) return true

    const hasAll = required.every((perm) => {
      if (userPermissions.has(perm)) return true
      // "user:*" grants "user:create", "user:read", etc.
      const [resource] = perm.split(":")
      return userPermissions.has(`${resource}:*`)
    })

    if (!hasAll) {
      throw new ForbiddenException("Insufficient permissions")
    }

    return true
  }
}
