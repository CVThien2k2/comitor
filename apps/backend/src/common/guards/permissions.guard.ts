import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { PermissionCode } from "@workspace/database"
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator"
import { RoleService } from "../../core/role/role.service"

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) return true

    const req = context.switchToHttp().getRequest()
    if (!req.user?.id) throw new ForbiddenException("Người dùng chưa được gán quyền nào")

    const userPermissions = await this.roleService.getUserPermissions(req.user.id)
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
}
