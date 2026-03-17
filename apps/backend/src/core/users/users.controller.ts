import { Controller, Get, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { User } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { Permissions } from "../../common/decorators/permissions.decorator"
import {
  ApiResponseOf,
  ApiResponseOfArray,
  ForbiddenEntity,
  UnauthorizedEntity,
  InternalServerErrorEntity,
} from "../../common/entities/api-response.entity"
import { UserEntity } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { P } from "@workspace/database"

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
  @ApiOkResponse({ type: ApiResponseOfArray(UserEntity) })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @Permissions(P.USER_READ)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll()
    return {
      message: "Lấy danh sách người dùng thành công",
      data: users,
    }
  }
}
