import { Body, Controller, Get, Param, Patch, Query, Req } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { ConversationService } from "./conversation.service"
import { ConversationQueryDto } from "./dto/conversation-query.dto"
import { UpdateConversationDto } from "./dto/update-conversation.dto"

@ApiTags("Conversations")
@ApiBearerAuth()
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Permissions(P.CONVERSATION_READ)
  @Get()
  async findAll(@Query() query: ConversationQueryDto, @Req() req: any) {
    const data = await this.conversationService.findAll(query, req.user.id)
    return { message: "Lấy danh sách cuộc hội thoại thành công", data }
  }

  @Permissions(P.CONVERSATION_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const conversation = await this.conversationService.findById(id)
    return { message: "Lấy thông tin cuộc hội thoại thành công", data: conversation }
  }

  @ApiOperation({ summary: "Cập nhật cuộc hội thoại" })
  @Permissions(P.CONVERSATION_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateConversationDto) {
    const conversation = await this.conversationService.update(id, dto)
    return { message: "Cập nhật cuộc hội thoại thành công", data: conversation }
  }

  @ApiOperation({ summary: "Đánh dấu tin nhắn mới nhất trong cuộc hội thoại là đã đọc" })
  @Patch(":id/mark-read")
  async markAsRead(@Param("id") id: string) {
    const result = await this.conversationService.markAsRead(id)
    return { message: "Đánh dấu đã đọc thành công", data: result.updatedMessages }
  }
}
