import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"
import { PrismaService } from "../database/prisma.service"
import { parseDays, parseDurationToMs } from "@workspace/shared"
import type { JwtPayload } from "../common/strategies/jwt.strategy"

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async generateTokens(userId: string, email: string) {
    const payload: JwtPayload = { userId, email }
    const accessExpiresIn =
      this.configService.get("JWT_ACCESS_EXPIRES_IN") ?? "15m"

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: accessExpiresIn,
    })

    const accessExpiresAt = Date.now() + parseDurationToMs(accessExpiresIn)

    const refreshExpiresIn =
      this.configService.get("JWT_REFRESH_EXPIRES_IN") ?? "7d"

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: refreshExpiresIn,
    })

    const refreshDays = parseDays(refreshExpiresIn)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + refreshDays)

    await this.prisma.client.refreshToken.create({
      data: {
        userId,
        token: this.hash(refreshToken),
        expiresAt,
      },
    })

    return { accessToken, accessExpiresAt, refreshToken }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      })
    } catch {
      throw new UnauthorizedException("Invalid refresh token")
    }

    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { token: this.hash(token) },
    })

    if (!stored || stored.revokedAt)
      throw new UnauthorizedException("Refresh token has been revoked")

    return payload
  }

  async revokeRefreshToken(token: string) {
    const hashed = this.hash(token)
    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { token: hashed },
    })

    if (stored && !stored.revokedAt) {
      await this.prisma.client.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      })
    }
  }

  async revokeAllByUserId(userId: string) {
    await this.prisma.client.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async cleanupExpired() {
    const { count } = await this.prisma.client.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
      },
    })
    return count
  }

  private hash(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }
}
