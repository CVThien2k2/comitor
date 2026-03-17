import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { User } from "@workspace/database"
import { P } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import {
  ApiPaginatedResponseOf,
  ApiResponseOf,
  BadRequestEntity,
  ConflictEntity,
  ForbiddenEntity,
  InternalServerErrorEntity,
  MessageResponseEntity,
  NotFoundEntity,
  UnauthorizedEntity,
} from "../../common/entities/api-response.entity"
import { UserEntity, UserListEntity, UserDetailEntity } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"

interface RequestWithUser extends ExpressRequest {
  user: User
}

@ApiTags("Users")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Lấy thông tin người dùng hiện tại" })
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @Get("me")
  me(@Request() req: RequestWithUser) {
    return {
      message: "Lấy thông tin người dùng thành công",
      data: req.user,
    }
  }

  @ApiOperation({ summary: "Lấy danh sách người dùng" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(UserListEntity) })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @Permissions(P.USER_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.usersService.findAll(query)
    return { message: "Lấy danh sách người dùng thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin người dùng theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(UserDetailEntity) })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.USER_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const user = await this.usersService.findByIdDetail(id)
    return { message: "Lấy thông tin người dùng thành công", data: user }
  }

  @ApiOperation({ summary: "Tạo người dùng mới" })
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiConflictResponse({ type: ConflictEntity })
  @Permissions(P.USER_CREATE)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto)
    return { message: "Tạo người dùng thành công", data: user }
  }

  @ApiOperation({ summary: "Cập nhật người dùng" })
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @ApiConflictResponse({ type: ConflictEntity })
  @Permissions(P.USER_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto)
    return { message: "Cập nhật người dùng thành công", data: user }
  }

  @ApiOperation({ summary: "Xóa người dùng" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.USER_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.usersService.delete(id)
    return { message: "Xóa người dùng thành công" }
  }
}
