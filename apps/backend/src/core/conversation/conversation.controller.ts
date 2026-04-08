import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import {
  ApiPaginatedResponseOf,
  ApiResponseOf,
  BadRequestEntity,
  ForbiddenEntity,
  InternalServerErrorEntity,
  MessageResponseEntity,
  NotFoundEntity,
  UnauthorizedEntity,
} from "../../common/entities/api-response.entity"
import { ConversationService } from "./conversation.service"
import { UpdateConversationDto } from "./dto/update-conversation.dto"
import { ConversationEntity } from "./entities/conversation.entity"

@ApiTags("Conversations")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOperation({ summary: "Lấy danh sách cuộc hội thoại" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(ConversationEntity) })
  @Permissions(P.CONVERSATION_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.conversationService.findAll(query)
    return { message: "Lấy danh sách cuộc hội thoại thành công", data }
  }

  @ApiOperation({ summary: "Lấy số cuộc hội thoại chưa đọc" })
  @ApiOkResponse({ type: ApiResponseOf(Number) })
  @Permissions(P.CONVERSATION_READ)
  @Get("unread-count")
  async unreadCount() {
    const data = await this.conversationService.countUnreadConversations()
    return { message: "Lấy số cuộc hội thoại chưa đọc thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin cuộc hội thoại theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(ConversationEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.CONVERSATION_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const conversation = await this.conversationService.findById(id)
    return { message: "Lấy thông tin cuộc hội thoại thành công", data: conversation }
  }

  @ApiOperation({ summary: "Cập nhật cuộc hội thoại" })
  @ApiOkResponse({ type: ApiResponseOf(ConversationEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.CONVERSATION_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateConversationDto) {
    const conversation = await this.conversationService.update(id, dto)
    return { message: "Cập nhật cuộc hội thoại thành công", data: conversation }
  }

  @ApiOperation({ summary: "Xóa cuộc hội thoại" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.CONVERSATION_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.conversationService.delete(id)
    return { message: "Xóa cuộc hội thoại thành công" }
  }

  @ApiOperation({ summary: "Đánh dấu tin nhắn mới nhất trong cuộc hội thoại là đã đọc" })
  @ApiOkResponse({ type: ApiResponseOf(Number) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_UPDATE)
  @Patch(":id/mark-read")
  async markAsRead(@Param("id") id: string) {
    const result = await this.conversationService.markAsRead(id)
    return { message: "Đánh dấu đã đọc thành công", data: result.updatedMessages }
  }
}
