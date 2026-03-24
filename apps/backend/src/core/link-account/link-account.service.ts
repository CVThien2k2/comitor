import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../../database/prisma.service"
import { RedisService } from "../../redis"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { UpdateLinkAccountDto } from "./dto/update-link-account.dto"
import { FetchWrapper } from "../../common/http/fetch.wrapper"
import { ChannelType } from "@workspace/database"

interface ZaloOaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface ZaloOaInfoResponse {
  data?: { oa_id: string; name: string; avatar: string; description?: string }
  error?: number
  message?: string
}

interface MetaTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface MetaPageData {
  id: string
  name: string
  access_token: string
  category?: string
}

interface MetaPagesResponse {
  data: MetaPageData[]
}

interface MetaAccountResponse {
  id: string
  name: string
  picture?: { data?: { url?: string } }
}

@Injectable()
export class LinkAccountService {
  private readonly logger = new Logger(LinkAccountService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = query.search
      ? {
          OR: [
            { displayName: { contains: query.search, mode: "insensitive" as const } },
            { accountId: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.client.linkAccount.findMany({
        where,
        include: { linkedByUser: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.linkAccount.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const account = await this.prisma.client.linkAccount.findUnique({
      where: { id },
      include: { linkedByUser: { select: { id: true, name: true, avatarUrl: true } } },
    })

    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    return account
  }

  async update(id: string, dto: UpdateLinkAccountDto) {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    return this.prisma.client.linkAccount.update({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string) {
    const account = await this.prisma.client.linkAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException("Liên kết kênh không tồn tại")

    await this.redisService.del(`link_account:${account.provider}:${account.accountId}`)
    await this.prisma.client.linkAccount.delete({ where: { id } })
  }

  // ─── Zalo OA OAuth ─────────────────────────────────────

  async linkZaloOa(code: string, userId: string) {
    const appId = this.configService.get<string>("ZALO_OA_ID")
    const secretKey = this.configService.get<string>("ZALO_OA_SECRET_KEY")
    const authApiUrl = this.configService.get<string>("ZALO_OA_AUTH_API_URL", "https://oauth.zaloapp.com")
    const apiUrl = this.configService.get<string>("ZALO_OA_API_URL", "https://openapi.zalo.me")

    if (!appId || !secretKey) {
      throw new BadRequestException("Chưa cấu hình Zalo OA (ZALO_OA_ID / ZALO_OA_SECRET_KEY)")
    }

    const headers = {
      secret_key: secretKey,
      "Content-Type": "application/x-www-form-urlencoded",
    }
    const body = new URLSearchParams({
      app_id: appId,
      grant_type: "authorization_code",
      code,
    })

    const authFetch = new FetchWrapper(authApiUrl)
    const tokenResponse = await authFetch.post<ZaloOaTokenResponse>(
      `/v4/oa/access_token`,
      {
        body,
      },
      headers
    )

    if (!tokenResponse.access_token) {
      throw new BadRequestException("Không thể lấy access token từ Zalo OA. Vui lòng thử lại.")
    }

    const apiFetch = new FetchWrapper(apiUrl)
    const oaInfo = await apiFetch.get<ZaloOaInfoResponse>(
      `/v2.0/oa/getoa`,
      {},
      { access_token: tokenResponse.access_token }
    )

    if (!oaInfo.data?.oa_id) {
      this.logger.error("Zalo OA info fetch failed", oaInfo)
      throw new BadRequestException("Không thể lấy thông tin OA. Vui lòng thử lại.")
    }

    const ttl = Number(tokenResponse.expires_in) || 86400
    const accessTokenExpiresAt = new Date(Date.now() + ttl * 1000)
    const refreshTokenExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    const linkAccount = await this.prisma.client.$transaction(async (tx) => {
      const linkAccount = await tx.linkAccount.upsert({
        where: {
          unique_account_link: {
            accountId: oaInfo.data?.oa_id || "unknown",
            provider: ChannelType.zalo_oa,
          },
        },
        update: {
          displayName: oaInfo.data?.name,
          avatarUrl: oaInfo.data?.avatar,
          linkedByUserId: userId,
        },
        create: {
          provider: ChannelType.zalo_oa,
          accountId: oaInfo.data?.oa_id || "unknown",
          displayName: oaInfo.data?.name,
          avatarUrl: oaInfo.data?.avatar,
          linkedByUserId: userId,
        },
      })

      await tx.providerCredentials.upsert({
        where: { linkAccountId: linkAccount.id },
        update: {
          credentialType: "oauth2",
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        },
        create: {
          linkAccountId: linkAccount.id,
          credentialType: "oauth2",
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        },
      })

      return tx.linkAccount.findUniqueOrThrow({
        where: { id: linkAccount.id },
        include: {
          linkedByUser: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      })
    })

    await this.redisService.set(
      `link_account:zalo_oa:${oaInfo.data?.oa_id || "unknown"}`,
      {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: ttl,
      },
      ttl
    )

    return linkAccount
  }

  // ─── Meta / Facebook OAuth ──────────────────────────────

  async linkMeta(code: string, userId: string) {
    const clientId = this.configService.get<string>("META_APP_ID")
    const clientSecret = this.configService.get<string>("META_APP_SECRET_KEY")
    const redirectUri = this.configService.get<string>("META_REDIRECT_URI")

    if (!clientId || !clientSecret) {
      throw new BadRequestException("Chưa cấu hình Meta (META_APP_ID / META_APP_SECRET_KEY)")
    }

    const graphFetch = new FetchWrapper("https://graph.facebook.com")

    const shortLivedToken = await graphFetch.get<MetaTokenResponse>(`/v20.0/oauth/access_token`, {
      query: { client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri ?? "", code },
    })

    if (!shortLivedToken.access_token) {
      this.logger.error("Meta token exchange failed", shortLivedToken)
      throw new BadRequestException("Không thể lấy access token từ Meta. Vui lòng thử lại.")
    }

    const longLivedToken = await graphFetch.get<MetaTokenResponse>(`/v20.0/oauth/access_token`, {
      query: {
        grant_type: "fb_exchange_token",
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: shortLivedToken.access_token,
      },
    })

    const accessToken = longLivedToken.access_token || shortLivedToken.access_token

    const pagesResponse = await graphFetch.get<MetaPagesResponse>(`/v20.0/me/accounts`, {
      query: { access_token: accessToken },
    })

    if (!pagesResponse.data?.length) {
      throw new BadRequestException("Không tìm thấy Facebook Page nào. Đảm bảo bạn đã cấp quyền quản lý trang.")
    }

    const results: unknown[] = []

    for (const page of pagesResponse.data) {
      const pageTtl = 60 * 24 * 60 * 60
      await this.redisService.set(
        `link_account:facebook:${page.id}`,
        { access_token: page.access_token, page_name: page.name, user_access_token: accessToken },
        pageTtl
      )

      let avatarUrl: string | null = null
      try {
        const pageInfo = await graphFetch.get<MetaAccountResponse>(`/${page.id}`, {
          query: { fields: "picture", access_token: page.access_token },
        })
        avatarUrl = pageInfo.picture?.data?.url ?? null
      } catch {
        /* avatar is optional */
      }

      const linkAccount = await this.prisma.client.linkAccount.upsert({
        where: { unique_account_link: { accountId: page.id, provider: "facebook" } },
        update: { displayName: page.name, avatarUrl, linkedByUserId: userId },
        create: {
          provider: "facebook",
          accountId: page.id,
          displayName: page.name,
          avatarUrl,
          linkedByUserId: userId,
        },
        include: { linkedByUser: { select: { id: true, name: true, avatarUrl: true } } },
      })

      results.push(linkAccount)
    }

    return results
  }
}
