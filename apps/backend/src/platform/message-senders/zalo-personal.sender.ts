import { Injectable, Logger } from "@nestjs/common"
import { ConversationService } from "src/core/conversation/conversation.service"
import { PrismaService } from "src/database/prisma.service"
import type { MessageSender } from "./message-sender.interface"

@Injectable()
export class ZaloPersonalSender implements MessageSender {
  private readonly logger = new Logger(ZaloPersonalSender.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService
  ) {}

  send() {}
}
