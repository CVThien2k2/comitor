import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import dotenv from "dotenv"
import { PrismaService } from "src/database/prisma.service"
import { RedisService } from "src/redis"

dotenv.config()

@Injectable()
export class ZaloOaAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService
  ) {}

  async getAccessToken(accountId: string): Promise<string> {
    const cached = await this.redis.get<string>(`link_account:zalo_oa:${accountId}`)
    if (cached) return JSON.parse(cached).access_token

    const linked = await this.prisma.client.linkAccount.findFirst({
      where: { provider: "zalo_oa", accountId },
      include: { providerCredentials: true },
    })
    const accessToken = linked?.providerCredentials?.accessToken ?? undefined
    if (!accessToken) throw new Error("Missing ZALO_OA_ACCESS_TOKEN")
    return accessToken
  }

  async refreshToken(params?: {
    refreshToken?: string
  }): Promise<{ access_token: string; refresh_token: string; expires_in?: number }> {
    const authBase = this.configService.get<string>("ZALO_OA_AUTH_API_URL")
    if (!authBase) throw new Error("Missing ZALO_OA_AUTH_API_URL")

    const appId = this.configService.get<string>("ZALO_OA_ID")
    if (!appId) throw new Error("Missing ZALO_OA_ID")

    const refreshToken = params?.refreshToken ?? this.configService.get<string>("ZALO_OA_REFRESH_TOKEN")
    if (!refreshToken) throw new Error("Missing ZALO_OA_REFRESH_TOKEN")

    const body = new URLSearchParams()
    body.set("app_id", appId)
    body.set("grant_type", "refresh_token")
    body.set("refresh_token", refreshToken)

    const res = await fetch(`${authBase}/v4/oa/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: this.configService.get<string>("ZALO_OA_SECRET_KEY") || "",
      },
      body,
    })
    const json = (await res.json()) as any
    const data = json?.data ?? json

    if (!data?.access_token || !data?.refresh_token) {
      throw new Error(json?.message || "Refresh token Zalo OA thất bại")
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: typeof data.expires_in === "number" ? data.expires_in : undefined,
    }
  }
}
