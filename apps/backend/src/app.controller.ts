import { Controller, HttpCode, HttpStatus, Logger, Post, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { Request as ExpressRequest } from "express"
import type { User } from "@workspace/database"
import {
  ApiResponseOf,
  InternalServerErrorEntity,
  UnauthorizedEntity,
} from "./common/entities/api-response.entity"
import { AppService } from "./app.service"

interface RequestWithUser extends ExpressRequest {
  user: User
}

class AppInitBadgesDto {
  @ApiProperty({ example: 0 })
  conversationsUnreadCount: number
}

class AppInitDto {
  @ApiProperty({ type: AppInitBadgesDto })
  badges: AppInitBadgesDto
}

@ApiTags("App")
@ApiBearerAuth()
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly appService: AppService) {}

  @Post("init")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Init hệ thống" })
  @ApiOkResponse({ type: ApiResponseOf(AppInitDto) })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  async init(@Request() req: RequestWithUser) {
    this.logger.log(`Init hệ thống được gọi bởi userId=${req.user.id}`)
    const data = await this.appService.init(req.user)
    return { message: "Khởi tạo hệ thống thành công", data }
  }
}
