import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { ApiPaginatedResponseOf, ApiResponseOf } from "../../common/entities/api-response.entity"
import { UpdatePermissionDescriptionDto } from "./dto/update-permission-description.dto"
import { PermissionEntity } from "./entities/permission.entity"
import { PermissionService } from "./permission.service"

@ApiTags("Permissions")
@ApiBearerAuth()
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

  @ApiOperation({ summary: "Cập nhật mô tả quyền" })
  @ApiOkResponse({ type: ApiResponseOf(PermissionEntity) })
  @Permissions(P.PERMISSION_UPDATE)
  @Patch(":id")
  async updateDescription(@Param("id") id: string, @Body() dto: UpdatePermissionDescriptionDto) {
    const data = await this.permissionService.updateDescription(id, dto)
    return { message: "Cập nhật mô tả quyền thành công", data }
  }
}
