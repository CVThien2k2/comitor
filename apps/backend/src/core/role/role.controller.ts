import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import { P } from "@workspace/database"
import type { User } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import {
  ApiPaginatedResponseOf,
  ApiResponseOf,
  MessageResponseEntity,
} from "../../common/entities/api-response.entity"
import { RoleEntity, RoleWithPermissionsEntity } from "./entities/role.entity"
import { RoleService } from "./role.service"
import { CreateRoleDto } from "./dto/create-role.dto"
import { UpdateRoleDto } from "./dto/update-role.dto"

interface RequestWithUser extends ExpressRequest {
  user: User
}

@ApiTags("Roles")
@ApiBearerAuth()
@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: "Lấy danh sách vai trò" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(RoleEntity) })
  @Permissions(P.ROLE_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.roleService.findAll(query)
    return { message: "Lấy danh sách vai trò thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin vai trò theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(RoleWithPermissionsEntity) })
  @Permissions(P.ROLE_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const role = await this.roleService.findById(id)
    return { message: "Lấy thông tin vai trò thành công", data: role }
  }

  @ApiOperation({ summary: "Tạo vai trò mới" })
  @ApiOkResponse({ type: ApiResponseOf(RoleWithPermissionsEntity) })
  @Permissions(P.ROLE_CREATE)
  @Post()
  async create(@Body() dto: CreateRoleDto, @Request() req: RequestWithUser) {
    const role = await this.roleService.create(dto, req.user.id)
    return { message: "Tạo vai trò thành công", data: role }
  }

  @ApiOperation({ summary: "Cập nhật vai trò" })
  @ApiOkResponse({ type: ApiResponseOf(RoleWithPermissionsEntity) })
  @Permissions(P.ROLE_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    const role = await this.roleService.update(id, dto)
    return { message: "Cập nhật vai trò thành công", data: role }
  }

  @ApiOperation({ summary: "Xóa vai trò" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @Permissions(P.ROLE_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.roleService.delete(id)
    return { message: "Xóa vai trò thành công" }
  }
}
