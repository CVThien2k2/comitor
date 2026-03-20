import { Injectable } from "@nestjs/common"
import { ZaloPersonalAuthService } from "./zalo_personal-auth.service"
import { ZaloPersonalSessionService } from "./zalo_personal-session.service"

@Injectable()
export class ZaloPersonalService {
  constructor(
    private readonly authService: ZaloPersonalAuthService,
    private readonly sessionService: ZaloPersonalSessionService,
  ) {}

  async getLinkedStatus(userId: string) {
    return this.authService.getLinkedStatus(userId)
  }

  async loginWithQR(userId: string) {
    return this.authService.loginWithQR(userId)
  }

  getLoginStatus(userId: string, sessionId: string) {
    return this.authService.getLoginStatus(userId, sessionId)
  }

  async getUserProfile(userId: string, linkedAccountId: string) {
    return this.sessionService.getUserProfile(userId, linkedAccountId)
  }

  async getGroupConversationName(groupId: string, linkedAccountId: string) {
    return this.sessionService.getGroupConversationName(groupId, linkedAccountId)
  }
}
