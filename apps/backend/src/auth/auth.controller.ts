import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import type { User } from "@workspace/database"

interface RequestWithUser extends Request {
  user: User
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Đăng ký tài khoản" })
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @ApiOperation({ summary: "Đăng nhập" })
  @Post("login")
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password)
    if (!user) throw new UnauthorizedException("Email hoặc mật khẩu không đúng")
    return this.authService.login(user)
  }

  @ApiOperation({ summary: "Lấy thông tin user hiện tại" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Request() req: RequestWithUser) {
    return req.user
  }
}
