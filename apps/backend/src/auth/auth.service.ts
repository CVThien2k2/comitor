import { Injectable, UnauthorizedException } from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import { UsersService } from "../core/users/users.service"
import { TokenService } from "./token.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsernameWithPassword(username)
    if (!user)
      throw new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      throw new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng")

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
}
