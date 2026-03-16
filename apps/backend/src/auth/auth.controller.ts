import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { parseDurationToMs } from "@workspace/shared"
import type { Request as ExpressRequest, Response } from "express"
import {
  ApiResponseOf,
  MessageResponseEntity,
  BadRequestEntity,
  UnauthorizedEntity,
  InternalServerErrorEntity,
} from "../common/entities/api-response.entity"
import { AuthService } from "./auth.service"
import { AuthEntity, RefreshEntity } from "./entities/auth.entity"
import { LoginDto } from "./dto/login.dto"

const REFRESH_TOKEN_COOKIE = "refresh_token"

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({ summary: "Login" })
  @ApiOkResponse({ type: ApiResponseOf(AuthEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, accessExpiresAt, refreshToken, user } = await this.authService.login(
      dto.username,
      dto.password
    )

    this.setRefreshCookie(res, refreshToken)
    return {
      message: "Đăng nhập thành công",
      data: { accessToken, accessExpiresAt, user },
    }
  }

  @ApiOperation({ summary: "Refresh session" })
  @ApiOkResponse({ type: ApiResponseOf(RefreshEntity) })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const oldToken = req.cookies?.[REFRESH_TOKEN_COOKIE]
    if (!oldToken) throw new UnauthorizedException("Refresh token not found")

    const { accessToken, accessExpiresAt, refreshToken, user } = await this.authService.refresh(oldToken)
    this.setRefreshCookie(res, refreshToken)
    return {
      message: "Token refreshed successfully",
      data: { accessToken, accessExpiresAt, user },
    }
  }

  @ApiOperation({ summary: "Logout" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE]
    if (token) {
      await this.authService.logout(token)
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/auth" })
    return { message: "Logout successful" }
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProduction = this.configService.get("NODE_ENV") === "production"

    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/auth",
      maxAge: parseDurationToMs(this.configService.get("JWT_REFRESH_EXPIRES_IN") ?? "7d"),
    })
  }
}
