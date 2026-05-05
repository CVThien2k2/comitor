import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from "@nestjs/common"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import type { User } from "@workspace/database"
import { P } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { ApiPaginatedResponseOf, ApiResponseOf, MessageResponseEntity } from "../../common/entities/api-response.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UserEntity, UserListEntity } from "./entities/user.entity"
import { UsersService } from "./users.service"

interface RequestWithUser extends ExpressRequest {
  user: User
}

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Lấy danh sách người dùng" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(UserListEntity) })
  @Permissions(P.USER_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.usersService.findAll(query)
    return { message: "Lấy danh sách người dùng thành công", data }
  }

  @ApiOperation({ summary: "Tạo người dùng mới" })
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @Permissions(P.USER_CREATE)
  @Post()
  async create(@Body() dto: CreateUserDto, @Request() req: RequestWithUser) {
    const user = await this.usersService.create(dto, req.user.id)
    return { message: "Tạo người dùng thành công", data: user }
  }

  @ApiOperation({ summary: "Cập nhật người dùng" })
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @Permissions(P.USER_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto)
    return { message: "Cập nhật người dùng thành công", data: user }
  }

  @ApiOperation({ summary: "Xóa người dùng" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @Permissions(P.USER_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.usersService.delete(id)
    return { message: "Xóa người dùng thành công" }
  }
}
