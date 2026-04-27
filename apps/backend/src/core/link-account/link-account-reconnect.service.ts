import { BadRequestException, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ChannelType } from "@workspace/database"
import { getPageInfo } from "src/platform/meta/api"
import { getProfile as getZaloOaProfile, refreshAccessToken } from "src/platform/zalo-oa/api"
import { mapAccountInfo as mapZaloOaAccountInfo } from "src/platform/zalo-oa/helper"
import { mapAccountInfo as mapZaloPersonalAccountInfo } from "src/platform/zalo/helper"
import { ZaloInstanceRegistry } from "src/platform/zalo/zalo-instance.registry"
import { LinkAccountService } from "./link-account.service"

type LinkAccount = Awaited<ReturnType<LinkAccountService["findById"]>>

@Injectable()
export class LinkAccountReconnectService {
  private readonly logger = new Logger(LinkAccountReconnectService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly linkAccountService: LinkAccountService,
    private readonly zaloInstanceRegistry: ZaloInstanceRegistry
  ) {}

  async reconnect(id: string) {
    const account = await this.linkAccountService.findById(id)

    if (account.provider === ChannelType.zalo_personal) {
      return await this.reconnectZaloPersonal(account)
    }

    if (account.provider === ChannelType.zalo_oa) {
      return await this.reconnectZaloOa(account)
    }

    if (account.provider === ChannelType.facebook) {
      return await this.reconnectFacebook(account)
    }

    throw new BadRequestException("Provider không hỗ trợ reconnect")
  }

  async disconnect(id: string) {
    const account = await this.linkAccountService.findById(id)

    if (account.provider === ChannelType.zalo_personal) {
      this.zaloInstanceRegistry.remove(account.id)
    }

    return await this.linkAccountService.updateStatus(account.id, "inactive")
  }

  private async reconnectZaloPersonal(account: LinkAccount) {
    const credentials = account.credentials as any
    const cookie = credentials?.cookie
    const imei = credentials?.imei
    const userAgent = credentials?.userAgent

    if (!account.accountId || !cookie || !imei || !userAgent) {
      throw new BadRequestException("Thông tin đăng nhập Zalo cá nhân không đầy đủ")
    }

    try {
      const zcaJs = (await import("zca-js")) as any
      const zalo = new zcaJs.Zalo({ selfListen: true, logging: false })
      const api = await zalo.login({ cookie, imei, userAgent })
      const accountInfo = await mapZaloPersonalAccountInfo(api)

      if (accountInfo.accountId !== account.accountId) {
        throw new BadRequestException("Thông tin Zalo cá nhân không khớp tài khoản liên kết")
      }

      this.zaloInstanceRegistry.set(account.id, api)
      return await this.linkAccountService.updateConnection(account.id, {
        status: "active",
        displayName: accountInfo.displayName,
        avatarUrl: accountInfo.avatarUrl,
        credentials: accountInfo.credentials,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error"
      await this.linkAccountService.updateStatus(account.id, "inactive")
      this.logger.error(`Reconnect Zalo cá nhân thất bại cho tài khoản ${account.accountId}: ${message}`)
      throw new BadRequestException("Reconnect Zalo cá nhân thất bại")
    }
  }

  private async reconnectZaloOa(account: LinkAccount) {
    const credentials = account.credentials as any
    const appId = this.configService.get<string>("ZALO_OA_ID", "")
    const secretKey = this.configService.get<string>("ZALO_OA_SECRET_KEY", "")
    let token = credentials
    let profile = token?.access_token ? await getZaloOaProfile(token.access_token) : null

    if (!profile && token?.refresh_token) {
      const refreshedToken = await refreshAccessToken({
        appId,
        secretKey,
        refreshToken: token.refresh_token,
      })
      if (refreshedToken?.access_token) {
        token = refreshedToken
        profile = await getZaloOaProfile(refreshedToken.access_token)
      }
    }

    if (!profile) {
      await this.linkAccountService.updateStatus(account.id, "inactive")
      throw new BadRequestException("Không thể lấy thông tin Zalo OA")
    }

    const accountInfo = mapZaloOaAccountInfo(profile)
    if (accountInfo.accountId !== account.accountId) {
      await this.linkAccountService.updateStatus(account.id, "inactive")
      throw new BadRequestException("Thông tin Zalo OA không khớp tài khoản liên kết")
    }

    return await this.linkAccountService.updateConnection(account.id, {
      status: "active",
      displayName: accountInfo.displayName,
      avatarUrl: accountInfo.avatarUrl,
      credentials: token,
    })
  }

  private async reconnectFacebook(account: LinkAccount) {
    const credentials = account.credentials as any
    const pageAccessToken = credentials?.pageAccessToken

    if (!account.accountId || !pageAccessToken) {
      throw new BadRequestException("Thông tin đăng nhập Facebook không đầy đủ")
    }

    const pageInfo = await getPageInfo(account.accountId, pageAccessToken)
    if (!pageInfo?.id || pageInfo.id !== account.accountId) {
      await this.linkAccountService.updateStatus(account.id, "inactive")
      throw new BadRequestException("Không thể lấy thông tin Facebook Page")
    }

    return await this.linkAccountService.updateConnection(account.id, {
      status: "active",
      displayName: pageInfo.name ?? account.displayName,
      avatarUrl: pageInfo.picture?.data?.url ?? account.avatarUrl,
    })
  }
}
