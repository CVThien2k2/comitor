import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { LinkAccount } from "@workspace/database"
import { UserProfilePlatform } from "src/utils/types"
import { getAccessToken, getProfile, getUserProfile, refreshAccessToken } from "./api"
import { mapAccountInfo, mapUserProfile } from "./helper"
import { LinkAccountService } from "src/core/link-account/link-account.service"

@Injectable()
export class ZaloOaService {
  private readonly appId: string
  private readonly secretKey: string
  private readonly logger = new Logger(ZaloOaService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly linkAccountService: LinkAccountService
  ) {
    this.appId = this.configService.get<string>("ZALO_OA_ID", "")
    this.secretKey = this.configService.get<string>("ZALO_OA_SECRET_KEY", "")
  }

  private getExpiredAt(expiresIn: number) {
    return new Date(Date.now() + expiresIn * 1000).toISOString()
  }

  async getAccessToken(linkedAccount: LinkAccount): Promise<string | null> {
    if (linkedAccount.status === "inactive") throw new BadRequestException("Liên kết Zalo OA đang bị khóa/inactive")

    const credentials = (linkedAccount.credentials ?? {}) as any
    const accessToken = credentials?.access_token
    const expiresAtMs = new Date(credentials?.expiredAt ?? 0).getTime()
    const isExpired = expiresAtMs > 0 && Date.now() >= expiresAtMs
    const isExpiringSoon = expiresAtMs > 0 && expiresAtMs - Date.now() < 30 * 60 * 1000

    if (accessToken && !isExpired && !isExpiringSoon) return accessToken as string

    if (!credentials?.refresh_token) {
      await this.linkAccountService.updateStatus(linkedAccount.id, "inactive")
      return null
    }
    try {
      const refreshed = await refreshAccessToken({
        appId: this.appId,
        secretKey: this.secretKey,
        refreshToken: credentials.refresh_token,
      })
      if (!refreshed?.access_token) {
        await this.linkAccountService.updateStatus(linkedAccount.id, "inactive")
        return null
      }

      const nextCredentials = {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expiredAt: this.getExpiredAt(refreshed.expires_in),
      }
      await this.linkAccountService.updateConnection(linkedAccount.id, {
        credentials: nextCredentials,
      })
      return nextCredentials.access_token
    } catch {
      await this.linkAccountService.updateStatus(linkedAccount.id, "inactive")
      this.logger.error(`Refresh token Zalo OA thất bại cho linked account ${linkedAccount.id} `)
      return null
    }
  }

  async getUserProfile(userId: string, linkedAccount: LinkAccount): Promise<UserProfilePlatform> {
    const accessToken = await this.getAccessToken(linkedAccount)
    if (!accessToken) throw new BadRequestException("Không thể lấy access token Zalo OA")

    const profile = await getUserProfile(accessToken, userId)
    if (!profile) throw new BadRequestException("Không tìm thấy thông tin người dùng trên Zalo OA")

    return mapUserProfile(profile)
  }

  //Kết nối Zalo OA và lấy token lưu vào hệ thống
  async connect(code: string, userId: string) {
    if (!code) throw new BadRequestException("Thiếu mã xác thực Zalo OA")

    const token = await getAccessToken({ appId: this.appId, secretKey: this.secretKey, code })
    if (!token) throw new InternalServerErrorException("Có lỗi xảy ra khi lấy access token từ Zalo OA")

    const profile = await getProfile(token.access_token)
    if (!profile) throw new InternalServerErrorException("Có lỗi xảy ra khi lấy thông tin Zalo OA")

    const accountInfo = mapAccountInfo(profile)
    await this.linkAccountService.create({
      ...accountInfo,
      credentials: {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expiredAt: this.getExpiredAt(token.expires_in),
      },
      createdBy: userId,
    })
    return { message: "Kết nối Zalo OA thành công" }
  }
}
