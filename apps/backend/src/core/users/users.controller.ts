import { Controller, Get, Request, UseGuards } from "@nestjs/common"
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
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { PermissionsGuard } from "../../common/guards/permissions.guard"
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
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Get current user" })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Request() req: RequestWithUser) {
    return {
      message: "User retrieved successfully",
      data: req.user,
    }
  }

  @ApiOperation({ summary: "Get all users" })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseOfArray(UserEntity) })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiForbiddenResponse({ type: ForbiddenEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(P.USER_READ)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll()
    return {
      message: "Users retrieved successfully",
      data: users,
    }
  }
}
