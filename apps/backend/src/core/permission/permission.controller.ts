import { Controller, Get, Query } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import {
  ApiPaginatedResponseOf,
  ForbiddenEntity,
  InternalServerErrorEntity,
  UnauthorizedEntity,
} from "../../common/entities/api-response.entity"
import { PermissionEntity } from "./entities/permission.entity"
import { PermissionService } from "./permission.service"

@ApiTags("Permissions")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: "Lấy danh sách quyền" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(PermissionEntity) })
  @Permissions(P.PERMISSION_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.permissionService.findAll(query)
    return { message: "Lấy danh sách quyền thành công", data }
  }
}
