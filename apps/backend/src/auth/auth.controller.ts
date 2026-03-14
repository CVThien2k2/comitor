import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { User } from "@workspace/database"
import { parseDaysToMs } from "@workspace/shared"
import type { Request as ExpressRequest, Response } from "express"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import {
  ApiResponseOf,
  BadRequestEntity,
  UnauthorizedEntity,
  InternalServerErrorEntity,
} from "../common/entities/api-response.entity"
import { AuthService } from "./auth.service"
import {
  AuthEntity,
  RefreshEntity,
  MessageEntity,
} from "./entities/auth.entity"
import { UserEntity } from "../core/users/entities/user.entity"
import { LoginDto } from "./dto/login.dto"

interface RequestWithUser extends ExpressRequest {
  user: User
}

const REFRESH_TOKEN_COOKIE = "refresh_token"

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({ summary: "Đăng nhập" })
  @ApiOkResponse({ type: ApiResponseOf(AuthEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, accessExpiresAt, refreshToken, user } =
      await this.authService.login(dto.username, dto.password)

    this.setRefreshCookie(res, refreshToken)
    return {
      message: "Đăng nhập thành công",
      data: { accessToken, accessExpiresAt, user },
    }
  }

  @ApiOperation({ summary: "Làm mới phiên" })
  @ApiOkResponse({ type: ApiResponseOf(RefreshEntity) })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const oldToken = req.cookies?.[REFRESH_TOKEN_COOKIE]
    if (!oldToken)
      throw new UnauthorizedException("Refresh token không tồn tại")

    const { accessToken, accessExpiresAt, refreshToken, user } =
      await this.authService.refresh(oldToken)
    this.setRefreshCookie(res, refreshToken)
    return {
      message: "Làm mới token thành công",
      data: { accessToken, accessExpiresAt, user },
    }
  }

  @ApiOperation({ summary: "Đăng xuất" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE]
    if (token) {
      await this.authService.logout(token)
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/auth" })
    return { message: "Đăng xuất thành công" }
  }

  @ApiOperation({ summary: "Lấy thông tin user hiện tại" })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseOf(UserEntity) })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Request() req: RequestWithUser) {
    return {
      message: "Lấy thông tin thành công",
      data: req.user,
    }
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProduction = this.configService.get("NODE_ENV") === "production"

    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/auth",
      maxAge: parseDaysToMs(
        this.configService.get("JWT_REFRESH_EXPIRES_IN") ?? "7d"
      ),
    })
  }
}
