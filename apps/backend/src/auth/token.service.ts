import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"
import { PrismaService } from "../database/prisma.service"
import { parseDurationToMs } from "@workspace/shared"
import type { JwtPayload } from "../common/strategies/jwt.strategy"

const MAX_SESSIONS = 5

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async generateTokens(userId: string, email: string) {
    const payload: JwtPayload = { userId, email }
    const accessExpiresIn = this.configService.get("JWT_ACCESS_EXPIRES_IN") ?? "15m"

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: accessExpiresIn,
    })

    const accessExpiresAt = Date.now() + parseDurationToMs(accessExpiresIn)

    const refreshExpiresIn = this.configService.get("JWT_REFRESH_EXPIRES_IN") ?? "7d"

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: refreshExpiresIn,
    })

    const expiresAt = new Date(Date.now() + parseDurationToMs(refreshExpiresIn))

    // Chỉ cần chờ tạo token, cleanup chạy nền
    await this.prisma.client.refreshToken.create({
      data: { userId, token: this.hash(refreshToken), expiresAt },
    })

    this.runInBackground(this.cleanupExpired(userId), this.enforceMaxSessions(userId))

    return { accessToken, accessExpiresAt, refreshToken }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      })
    } catch {
      throw new UnauthorizedException("Refresh token không hợp lệ")
    }

    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { token: this.hash(token) },
    })

    if (!stored) throw new UnauthorizedException("Không tìm thấy refresh token")

    if (stored.expiresAt < new Date()) {
      // Xóa token hết hạn nền, không cần chờ
      this.runInBackground(this.prisma.client.refreshToken.delete({ where: { id: stored.id } }))
      throw new UnauthorizedException("Refresh token đã hết hạn")
    }

    return payload
  }

  revokeRefreshToken(token: string) {
    this.runInBackground(
      this.prisma.client.refreshToken.deleteMany({
        where: { token: this.hash(token) },
      })
    )
  }

  revokeAllByUserId(userId: string) {
    this.runInBackground(
      this.prisma.client.refreshToken.deleteMany({
        where: { userId },
      })
    )
  }

  private async cleanupExpired(userId: string) {
    await this.prisma.client.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    })
  }

  private async enforceMaxSessions(userId: string) {
    const tokens = await this.prisma.client.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })

    if (tokens.length >= MAX_SESSIONS) {
      const tokensToDelete = tokens.slice(0, tokens.length - MAX_SESSIONS + 1)
      await this.prisma.client.refreshToken.deleteMany({
        where: { id: { in: tokensToDelete.map((t) => t.id) } },
      })
    }
  }

  private runInBackground(...promises: Promise<unknown>[]) {
    Promise.allSettled(promises).catch((err) => this.logger.error("Background task failed", err))
  }

  private hash(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }
}
