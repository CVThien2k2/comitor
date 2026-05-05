import { Body, Controller, Get, Param, Post, Query, Request } from "@nestjs/common"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { ApiResponseOf } from "../../common/entities/api-response.entity"
import { MessageEntity } from "./entities/message.entity"
import { MessageService } from "./message.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { MessageCursorQueryDto } from "./dto/message-cursor-query.dto"

@ApiTags("Messages")
@ApiBearerAuth()
@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: "Lấy danh sách tin nhắn theo cuộc hội thoại" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @Permissions(P.MESSAGE_READ)
  @Get("conversation/:conversationId")
  async findByConversationId(@Param("conversationId") conversationId: string, @Query() query: MessageCursorQueryDto) {
    const data = await this.messageService.findByConversationId(conversationId, query)
    return { message: "Lấy danh sách tin nhắn thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin tin nhắn theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @Permissions(P.MESSAGE_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const msg = await this.messageService.findById(id)
    return { message: "Lấy thông tin tin nhắn thành công", data: msg }
  }

  @ApiOperation({ summary: "Gửi tin nhắn" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @Permissions(P.MESSAGE_CREATE)
  @Post()
  async create(@Body() dto: CreateMessageDto, @Request() req: any) {
    const msg = await this.messageService.create(dto, req.user.id)
    return { message: "Gửi tin nhắn thành công", data: msg }
  }

}
