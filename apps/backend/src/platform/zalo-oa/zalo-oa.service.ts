import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { getAccessToken, getProfile } from "./api"
import { mapAccountInfo } from "./helper"
import { LinkAccountService } from "src/core/link-account/link-account.service"

@Injectable()
export class ZaloOaService {
  private readonly appId: string
  private readonly secretKey: string

  constructor(
    private readonly configService: ConfigService,
    private readonly linkAccountService: LinkAccountService
  ) {
    this.appId = this.configService.get<string>("ZALO_OA_ID", "")
    this.secretKey = this.configService.get<string>("ZALO_OA_SECRET_KEY", "")
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
      credentials: token,
      createdBy: userId,
    })
    return { message: "Kết nối Zalo OA thành công" }
  }
}
