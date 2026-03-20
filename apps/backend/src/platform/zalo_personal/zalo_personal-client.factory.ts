import { Injectable } from "@nestjs/common"
import { ZaloPersonalCredentials } from "./utils/credentials"

@Injectable()
export class ZaloPersonalClientFactory {
  async createClient() {
    const zcaJs = (await import("zca-js")) as any
    const zalo = new zcaJs.Zalo({
      selfListen: true,
    })

    return { zcaJs, zalo }
  }

  async loginWithCredentials(credentials: ZaloPersonalCredentials) {
    const { zalo } = await this.createClient()
    return zalo.login(credentials)
  }
}
