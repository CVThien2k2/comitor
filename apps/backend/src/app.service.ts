import { Injectable, Logger } from "@nestjs/common"
import { ConversationService } from "./core/conversation/conversation.service"
import { User } from "@workspace/database"

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  constructor(private readonly conversationService: ConversationService) {}

  async init(user: User) {
    const [unreadCount] = await Promise.all([this.conversationService.countUnreadConversations()])

    return {
      user,
      badges: {
        conversationsUnreadCount: unreadCount,
      },
    }
  }
}
