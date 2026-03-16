import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as bcrypt from "bcryptjs"
import * as crypto from "crypto"
import { UsersService } from "../core/users/users.service"
import { EmailService } from "../email/email.service"
import { RedisService } from "../redis/redis.service"
import { EmailType } from "../utils/email"
import { TokenService } from "./token.service"

const RESET_TOKEN_PREFIX = "reset:"

@Injectable()
export class AuthService {
  private readonly resetTokenTtl: number

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {
    this.resetTokenTtl = this.configService.get<number>("RESET_TOKEN_TTL", 900)
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsernameWithPassword(username)
    if (!user) throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không hợp lệ")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không hợp lệ")

    const tokens = await this.tokenService.generateTokens(user.id, user.email)
    const { password: _, ...userData } = user
    return { ...tokens, user: userData }
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.tokenService.revokeRefreshToken(refreshToken)

    const user = await this.usersService.findById(payload.userId)
    if (!user) throw new UnauthorizedException()

    const tokens = await this.tokenService.generateTokens(user.id, user.email)
    return { ...tokens, user }
  }

  async logout(refreshToken: string) {
    await this.tokenService.revokeRefreshToken(refreshToken)
  }

  async forgotPassword(username: string) {
    const user = await this.usersService.findByUsername(username)
    // Luôn trả success để tránh leak thông tin user tồn tại
    if (!user) return

    const token = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    await this.redisService.set(`${RESET_TOKEN_PREFIX}${hashedToken}`, user.id, this.resetTokenTtl)

    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3000")
    const resetLink = `${frontendUrl}/reset-password?token=${token}`

    // Gửi email chạy ngầm, không block response
    this.emailService.send(EmailType.RESET_PASSWORD, {
      email: user.email,
      firstName: user.name,
      url: resetLink,
    })
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const redisKey = `${RESET_TOKEN_PREFIX}${hashedToken}`

    const userId = await this.redisService.get<string>(redisKey)
    if (!userId) {
      throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn")
    }

    await this.usersService.updatePassword(userId, newPassword)

    // Xóa token sau khi dùng
    await this.redisService.del(redisKey)

    // Revoke tất cả refresh token của user (buộc đăng nhập lại)
    this.tokenService.revokeAllByUserId(userId)
  }
}
