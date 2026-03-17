import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import {
  ApiResponseOf,
  ApiResponseOfArray,
  BadRequestEntity,
  ConflictEntity,
  ForbiddenEntity,
  InternalServerErrorEntity,
  MessageResponseEntity,
  NotFoundEntity,
  UnauthorizedEntity,
} from "../../common/entities/api-response.entity"
import { RoleWithPermissionsEntity } from "./entities/role.entity"
import { RoleService } from "./role.service"
import { CreateRoleDto } from "./dto/create-role.dto"
import { UpdateRoleDto } from "./dto/update-role.dto"

@ApiTags("Roles")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: "Lấy danh sách vai trò" })
  @ApiOkResponse({ type: ApiResponseOfArray(RoleWithPermissionsEntity) })
  @Permissions(P.ROLE_READ)
  @Get()
  async findAll() {
    const roles = await this.roleService.findAll()
    return { message: "Lấy danh sách vai trò thành công", data: roles }
  }

  @ApiOperation({ summary: "Lấy thông tin vai trò theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(RoleWithPermissionsEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.ROLE_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const role = await this.roleService.findById(id)
    return { message: "Lấy thông tin vai trò thành công", data: role }
  }

  @ApiOperation({ summary: "Tạo vai trò mới" })
  @ApiOkResponse({ type: ApiResponseOf(RoleWithPermissionsEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiConflictResponse({ type: ConflictEntity })
  @Permissions(P.ROLE_CREATE)
  @Post()
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.roleService.create(dto)
    return { message: "Tạo vai trò thành công", data: role }
  }

  @ApiOperation({ summary: "Cập nhật vai trò" })
  @ApiOkResponse({ type: ApiResponseOf(RoleWithPermissionsEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @ApiConflictResponse({ type: ConflictEntity })
  @Permissions(P.ROLE_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    const role = await this.roleService.update(id, dto)
    return { message: "Cập nhật vai trò thành công", data: role }
  }

  @ApiOperation({ summary: "Xóa vai trò" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.ROLE_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.roleService.delete(id)
    return { message: "Xóa vai trò thành công" }
  }
}
