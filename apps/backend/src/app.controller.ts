import { Controller, Get, HttpCode, HttpStatus, Logger, Post, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { User } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { AppService } from "./app.service"
import { Public } from "./common/decorators/public.decorator"
import { ApiResponseOf, InternalServerErrorEntity, UnauthorizedEntity } from "./common/entities/api-response.entity"
import { UserEntity } from "./core/users/entities/user.entity"

interface RequestWithUser extends ExpressRequest {
  user: User
}

class AppInitBadgesDto {
  @ApiProperty({ example: 0 })
  conversationsUnreadCount: number
}

class AppInitDto {
  @ApiProperty({ type: UserEntity })
  user: UserEntity

  @ApiProperty({ type: [String] })
  permissions: string[]

  @ApiProperty({ type: AppInitBadgesDto })
  badges: AppInitBadgesDto
}

@ApiTags("App")
@ApiBearerAuth()
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("live")
  @HttpCode(HttpStatus.OK)
  // Endpoint cho liveness probe.
  live() {
    return this.appService.live()
  }

  @Public()
  @Get("ready")
  @HttpCode(HttpStatus.OK)
  // Endpoint cho readiness probe.
  async ready() {
    const result = await this.appService.ready()
    return result
  }

  @Public()
  @Get("health")
  @HttpCode(HttpStatus.OK)
  // Endpoint tổng hợp để monitor nhanh trạng thái hệ thống.
  async health() {
    const live = this.appService.live()
    const ready = await this.appService.ready()

    return {
      status: ready.status === "ready" ? "ok" : "degraded",
      live,
      ready,
    }
  }

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
