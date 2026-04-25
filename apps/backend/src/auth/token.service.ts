import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"
import { PrismaService } from "../database/prisma.service"
import { parseDurationToMs } from "../utils/helper/date-time"
import type { JwtPayload } from "../common/strategies/jwt.strategy"
import { MAX_SESSIONS } from "src/utils/constant"

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
    const { refreshToken, hashToken } = await this.generateUniqueRefreshToken()

    const expiresAt = new Date(Date.now() + parseDurationToMs(refreshExpiresIn))

    // Chỉ cần chờ tạo token, cleanup chạy nền
    await this.prisma.client.refreshToken.create({
      data: { userId, hashToken, expiresAt },
    })

    this.runInBackground(this.cleanupExpired(), this.enforceMaxSessions(userId))

    return { accessToken, accessExpiresAt, refreshToken }
  }

  async verifyRefreshToken(token: string) {
    const hashToken = this.hash(token)
    const stored = await this.prisma.client.refreshToken.findFirst({
      where: { hashToken },
      include: {
        user: {
          select: { id: true, email: true, isActive: true, isDeleted: true },
        },
      },
    })
    if (!stored) throw new UnauthorizedException("Token không hợp lệ")
    if (!stored.user) throw new UnauthorizedException("Không tìm thấy tài khoản")
    if (stored.user.isDeleted) throw new UnauthorizedException("Tài khoản đã bị xóa")
    if (!stored.user.isActive) throw new UnauthorizedException("Tài khoản đã bị khóa")

    this.revokeRefreshToken(hashToken)
    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Token đã hết hạn")
    }
    return { userId: stored.user.id, email: stored.user.email }
  }

  revokeRefreshToken(hashToken: string) {
    this.runInBackground(
      this.prisma.client.refreshToken.delete({
        where: { hashToken },
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

  private async cleanupExpired() {
    await this.prisma.client.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  }

  private async enforceMaxSessions(userId: string) {
    const tokens = await this.prisma.client.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    })
    if (tokens.length > MAX_SESSIONS) {
      const tokensToDelete = tokens.slice(0, tokens.length - MAX_SESSIONS)
      await this.prisma.client.refreshToken.deleteMany({
        where: { hashToken: { in: tokensToDelete.map((t) => t.hashToken) } },
      })
    }
  }

  private runInBackground(...promises: Promise<unknown>[]) {
    void Promise.allSettled(promises).then(
      (results) => {
        for (const result of results) {
          if (result.status === "rejected") {
            this.logger.error("Background task failed", (result.reason as Error).message)
          }
        }
      },
      (err) => this.logger.error("Background task failed", err.message)
    )
  }

  private async generateUniqueRefreshToken() {
    for (let i = 0; i < 5; i++) {
      const refreshToken = crypto.randomBytes(64).toString("hex")
      const hashToken = this.hash(refreshToken)

      const existed = await this.prisma.client.refreshToken.findFirst({
        where: { hashToken },
        select: { hashToken: true },
      })

      if (!existed) return { refreshToken, hashToken }
    }

    throw new InternalServerErrorException("Trong quá trình tạo token, đã xảy ra lỗi. Vui lòng thử lại sau.")
  }

  private hash(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }
}
