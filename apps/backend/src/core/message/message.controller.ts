import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import {
  ApiResponseOf,
  BadRequestEntity,
  ForbiddenEntity,
  InternalServerErrorEntity,
  MessageResponseEntity,
  NotFoundEntity,
  UnauthorizedEntity,
} from "../../common/entities/api-response.entity"
import { MessageBaseEntity, MessageEntity } from "./entities/message.entity"
import { MessageService } from "./message.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { MessageCursorQueryDto } from "./dto/message-cursor-query.dto"
import { MessageSearchQueryDto } from "./dto/message-search-query.dto"
import { UpdateMessageDto } from "./dto/update-message.dto"

@ApiTags("Messages")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: "Lấy danh sách tin nhắn theo cuộc hội thoại" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_READ)
  @Get("conversation/:conversationId")
  async findByConversationId(@Param("conversationId") conversationId: string, @Query() query: MessageCursorQueryDto) {
    const data = await this.messageService.findByConversationId(conversationId, query)
    return { message: "Lấy danh sách tin nhắn thành công", data }
  }

  @ApiOperation({ summary: "Lấy danh sách tin nhắn chứa từ khóa theo cuộc hội thoại" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_READ)
  @Get("conversation/:conversationId/search")
  async searchInConversation(@Param("conversationId") conversationId: string, @Query() query: MessageSearchQueryDto) {
    const data = await this.messageService.searchInConversation(conversationId, query)
    return { message: "Tìm kiếm tin nhắn thành công", data }
  }

  @ApiOperation({ summary: "Lấy window tin nhắn xung quanh 1 message cụ thể" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_READ)
  @Get("conversation/:conversationId/around/:messageId")
  async findAroundMessage(
    @Param("conversationId") conversationId: string,
    @Param("messageId") messageId: string,
    @Query("before") before?: string,
    @Query("after") after?: string
  ) {
    const data = await this.messageService.findAroundMessage(
      conversationId,
      messageId,
      before ? Number(before) : undefined,
      after ? Number(after) : undefined
    )
    return { message: "Lấy tin nhắn theo anchor thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin tin nhắn theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const msg = await this.messageService.findById(id)
    return { message: "Lấy thông tin tin nhắn thành công", data: msg }
  }

  @ApiOperation({ summary: "Gửi tin nhắn" })
  @ApiOkResponse({ type: ApiResponseOf(MessageEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_CREATE)
  @Post()
  async create(@Body() dto: CreateMessageDto, @Request() req: any) {
    const msg = await this.messageService.create(dto, req.user.id)
    return { message: "Gửi tin nhắn thành công", data: msg }
  }

  @ApiOperation({ summary: "Cập nhật tin nhắn" })
  @ApiOkResponse({ type: ApiResponseOf(MessageBaseEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateMessageDto) {
    const msg = await this.messageService.update(id, dto)
    return { message: "Cập nhật tin nhắn thành công", data: msg }
  }

  @ApiOperation({ summary: "Xóa tin nhắn" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.messageService.delete(id)
    return { message: "Xóa tin nhắn thành công" }
  }
}
