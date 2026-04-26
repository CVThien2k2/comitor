import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { LinkAccountService } from "src/core/link-account/link-account.service"
import { getLongLivedUserToken, getPageAccounts, getPageInfo, getUserAccessToken } from "./api"
import { ChannelType } from "@workspace/database"

@Injectable()
export class MetaService {
  private readonly appId: string
  private readonly appSecret: string
  private readonly frontendUrl: string
  constructor(
    private readonly configService: ConfigService,
    private readonly linkAccountService: LinkAccountService
  ) {
    this.appId = this.configService.get<string>("META_APP_ID", "")
    this.appSecret = this.configService.get<string>("META_APP_SECRET_KEY", "")
    this.frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3000")
  }

  async connect(code: string, userId: string) {
    if (!code) throw new BadRequestException("Thiếu mã xác thực Facebook")

    if (!this.appId || !this.appSecret) {
      throw new BadRequestException("Hệ thống chưa cấu hình Facebook")
    }

    const shortLivedToken = await getUserAccessToken({
      appId: this.appId,
      appSecret: this.appSecret,
      redirectUri: `${this.frontendUrl}/links`,
      code,
    })

    if (!shortLivedToken?.access_token)
      throw new InternalServerErrorException("Có lỗi xảy ra khi lấy User Access Token từ Facebook")

    const longLivedToken = await getLongLivedUserToken({
      appId: this.appId,
      appSecret: this.appSecret,
      shortLivedToken: shortLivedToken.access_token,
    })

    const userAccessToken = longLivedToken?.access_token ?? shortLivedToken.access_token
    const pages = await getPageAccounts(userAccessToken)

    if (!pages?.length)
      throw new BadRequestException(
        "Không tìm thấy Facebook Page nào. Hãy kiểm tra quyền ứng dụng và quyền quản lý trang."
      )

    for (const page of pages) {
      const pageInfo = await getPageInfo(page.id, page.access_token)
      const avatarUrl = pageInfo?.picture?.data?.url ?? ""

      await this.linkAccountService.create({
        provider: "facebook" as ChannelType,
        accountId: page.id,
        displayName: page.name,
        avatarUrl,
        credentials: {
          pageAccessToken: page.access_token,
          userAccessToken,
        },
        createdBy: userId,
      })
    }

    return { message: "Kết nối Facebook thành công" }
  }
}
