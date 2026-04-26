import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { LinkAccountService } from "src/core/link-account/link-account.service"
import { ZaloInstanceRegistry } from "./zalo-instance.registry"

@Injectable()
export class ZaloReconnectService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ZaloReconnectService.name)

  constructor(
    private readonly linkAccountService: LinkAccountService,
    private readonly zaloInstanceRegistry: ZaloInstanceRegistry
  ) {}

  //Khôi phục phiên đăng nhập Zalo cá nhân khi khởi động lại server
  async onApplicationBootstrap() {
    const accounts = await this.linkAccountService.getZaloToConnect()
    if (!accounts.length) return

    const zcaJs = (await import("zca-js")) as any

    for (const account of accounts) {
      try {
        const credentials = account.credentials as any
        const cookie = credentials?.cookie
        const imei = credentials?.imei
        const userAgent = credentials?.userAgent

        if (!account.accountId || !cookie || !imei || !userAgent) continue

        const zalo = new zcaJs.Zalo({ selfListen: true, logging: false })
        const api = await zalo.login({ cookie, imei, userAgent })

        this.zaloInstanceRegistry.set(account.id, api)
        this.startListening(api, zcaJs)
        this.logger.log(`Khôi phục phiên đăng nhập thành công cho tài khoản ${account.accountId}`)
      } catch {
        await this.linkAccountService.updateStatus(account.id, "inactive") //Chuyển trang thái từ active sang inactive nếu khôi phục thất bại
        this.logger.error(`Khôi phục phiên đăng nhập Zalo cá nhân thất bại cho tài khoản ${account.accountId}`)
      }
    }
  }

  //Khởi tạo sự kiện lắng nghe
  startListening(api: any, zcaJs: any) {
    try {
      api.listener.on("message", (message) => {
        console.log("message")
      })
      api.listener.on("reaction", (reaction) => {
        console.log("reaction")
      })
      api.listener.on("undo", (undo) => {
        console.log("undo")
      })
      api.listener.on("group_event", (data) => {
        console.log("group_event")
      })

      api.listener.start()
    } catch {
      this.logger.error("Mất kết nối với Zalo cá nhân")
    }
  }
}
