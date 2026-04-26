import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { Response } from "express"

@Injectable()
export class PlatformService {
  private readonly frontendUrl: string
  private readonly zaloOaAppId: string
  private readonly metaAppId: string
  private readonly zaloOaAuthApiUrl = "https://oauth.zaloapp.com/v4/oa/permission"
  private readonly metaAuthApiUrl = "https://www.facebook.com/v25.0/dialog/oauth"

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3000")
    this.zaloOaAppId = this.configService.get<string>("ZALO_OA_ID", "")
    this.metaAppId = this.configService.get<string>("META_APP_ID", "")
  }

  //Redirect người dùng về frontend với status và message
  redirectClient(res: Response, provider: string, status: "success" | "error", message: string) {
    const redirectUrl = new URL(`${this.frontendUrl}/links`)

    redirectUrl.searchParams.set("provider", provider)
    redirectUrl.searchParams.set("status", status)
    redirectUrl.searchParams.set("message", message)

    return res.redirect(redirectUrl.toString())
  }

  //Build URL để người dùng đăng nhập Zalo OA
  buildZaloOaConnectUrl(res: Response) {
    if (!this.zaloOaAppId) return this.redirectClient(res, "zalo_oa", "error", "Hệ thống chưa cấu hình Zalo OA")

    const redirectUri = `${this.frontendUrl}/links`
    const permissionUrl = new URL(this.zaloOaAuthApiUrl)

    permissionUrl.searchParams.set("app_id", this.zaloOaAppId)
    permissionUrl.searchParams.set("redirect_uri", redirectUri)
    return res.redirect(permissionUrl.toString())
  }

  //Build URL để người dùng đăng nhập Facebook Page
  buildMetaConnectUrl(res: Response) {
    if (!this.metaAppId) return this.redirectClient(res, "facebook", "error", "Hệ thống chưa cấu hình Facebook")

    const permissionUrl = new URL(this.metaAuthApiUrl)
    permissionUrl.searchParams.set("client_id", this.metaAppId)
    permissionUrl.searchParams.set("redirect_uri", `${this.frontendUrl}/links`)
    permissionUrl.searchParams.set("response_type", "code")
    permissionUrl.searchParams.set(
      "scope",
      "pages_show_list,pages_messaging,pages_read_engagement,pages_manage_metadata,business_management"
    )
    permissionUrl.searchParams.set("state", "facebook")

    return res.redirect(permissionUrl.toString())
  }
}
