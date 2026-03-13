import { Injectable, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { UsersService } from "../core/users/users.service"
import { PrismaService } from "../database/prisma.service"
import type { RegisterDto } from "./dto/register.dto"
import { ProviderType, type User } from "@workspace/database"
import type { JwtPayload } from "../common/strategies/jwt.strategy"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email)
    if (!user) return null

    const account = await this.prisma.client.account.findFirst({
      where: { userId: user.id, provider: ProviderType.credentials },
    })
    if (!account?.password) return null

    const isMatch = await bcrypt.compare(password, account.password)
    return isMatch ? user : null
  }

  login(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email }
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email },
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) throw new ConflictException("Email đã được sử dụng")

    const hashed = await bcrypt.hash(dto.password, 10)

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
    })

    await this.prisma.client.account.create({
      data: {
        userId: user.id,
        username: dto.username ?? dto.email,
        provider: ProviderType.credentials,
        providerAccountId: user.id,
        password: hashed,
      },
    })

    return this.login(user)
  }
}
