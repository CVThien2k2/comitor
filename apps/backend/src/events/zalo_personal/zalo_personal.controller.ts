import { Controller, Get, Param, Post } from "@nestjs/common"
import { ZaloPersonalService } from "./zalo_personal.service"

@Controller("zalo-personal")
export class ZaloPersonalController {
  constructor(private readonly zaloPersonalService: ZaloPersonalService) {}

  @Post("login-qr")
  loginWithQR() {
    return this.zaloPersonalService.loginWithQR()
  }

  @Get("login-qr/:sessionId")
  getLoginStatus(@Param("sessionId") sessionId: string) {
    return this.zaloPersonalService.getLoginStatus(sessionId)
  }
}
