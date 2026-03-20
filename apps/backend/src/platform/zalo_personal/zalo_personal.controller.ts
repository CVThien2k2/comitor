import { Controller, Get, Param, Post, Request } from "@nestjs/common"
import type { User } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { ZaloPersonalService } from "./zalo_personal.service"

@Controller("zalo-personal")
export class ZaloPersonalController {
  constructor(private readonly zaloPersonalService: ZaloPersonalService) {}

  @Get("status")
  getLinkedStatus(@Request() req: ExpressRequest & { user: User }) {
    return this.zaloPersonalService.getLinkedStatus(req.user.id)
  }

  @Post("login-qr")
  loginWithQR(@Request() req: ExpressRequest & { user: User }) {
    return this.zaloPersonalService.loginWithQR(req.user.id)
  }

  @Get("login-qr/:sessionId")
  getLoginStatus(@Request() req: ExpressRequest & { user: User }, @Param("sessionId") sessionId: string) {
    return this.zaloPersonalService.getLoginStatus(req.user.id, sessionId)
  }
}
