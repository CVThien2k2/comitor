import { BadRequestException, Injectable, Logger } from "@nestjs/common"
import type { MessageSender, MessageSenderInput } from "./message-sender.interface"
import { PrismaService } from "src/database/prisma.service"
import { ConversationService } from "src/core/conversation/conversation.service"
import { ZaloPersonalSessionService } from "../zalo_personal/zalo_personal-session.service"
import { ZaloPersonalMessageService } from "../zalo_personal/zalo_personal-message.service"

@Injectable()
export class ZaloPersonalSender implements MessageSender {
  private readonly logger = new Logger(ZaloPersonalSender.name)

  constructor(private readonly prisma: PrismaService, private readonly conversationService: ConversationService, private readonly zaloPersonalSessionService: ZaloPersonalSessionService, private readonly zaloPersonalMessageService: ZaloPersonalMessageService) {}

  async send(input: MessageSenderInput): Promise<void> {
    this.logger.log(
      `[Zalo Personal] Gửi tin nhắn ${input.message.id} đến cuộc hội thoại ${input.message.conversationId}`
    )
    const { threadId, threadType } = await this.resolveThreadType(input);
    const session = await this.zaloPersonalSessionService.ensureActiveSession(input.linkedAccount.id);
    const text = input.message.content || "";
    const attachments = input.message.attachments || [];
    const attachmentCount = attachments.length;

    if (text && attachmentCount === 0) {
      const response = await this.zaloPersonalMessageService.sendText(session.api, threadId, threadType, text)
      this.logger.log('Gửi tin nhắn văn bản thành công', { response })
      return response
    } else if (!text && attachmentCount > 0) {
      const attachmentInputs = attachments.map((a) => ({
        fileName: a.fileName,
        fileType: a.fileType,
        fileUrl: a.fileUrl,
        fileMimeType: a.fileMimeType,
        key: a.key,
      }))

      const response = await this.zaloPersonalMessageService.sendAttachments(
        session.api,
        threadId,
        threadType,
        attachmentInputs
      )

      return response
    } else if (text && attachmentCount > 0) {
      const attachmentInputs = attachments.map((a) => ({
        fileName: a.fileName,
        fileType: a.fileType,
        fileUrl: a.fileUrl,
        fileMimeType: a.fileMimeType,
        key: a.key,
      }))

      const response = await this.zaloPersonalMessageService.sendCombinedMessage(
        session.api,
        threadId,
        threadType,
        text,
        attachmentInputs
      )

      return response
    } else {
      throw new BadRequestException("Tin nhắn phải có nội dung hoặc attachments")
    }
  }


  /**
   * Helpers
   */

  private async resolveThreadType(input: MessageSenderInput) {
     const conversation = await this.conversationService.findById(input.message.conversationId);
    const externalConversationId = conversation.externalId;
    if (conversation.linkedAccountId !== input.linkedAccount.id || !externalConversationId) 
      throw new BadRequestException(`Cuộc hội thoại ${input.message.conversationId} không có externalConversationId hợp lệ`)
    const threadId = externalConversationId.trim();
    const conversationType = conversation.type === 'group' ? 1 : 0;

    return { threadId, threadType: conversationType };
  }
}
