import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common"
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
import { ConversationDetailEntity, ConversationListEntity } from "./entities/conversation.entity"
import { ConversationService } from "./conversation.service"
import { UpdateConversationDto } from "./dto/update-conversation.dto"

@ApiTags("Conversations")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOperation({ summary: "Lấy danh sách cuộc hội thoại" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(ConversationListEntity) })
  @Permissions(P.CONVERSATION_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.conversationService.findAll(query)
    return { message: "Lấy danh sách cuộc hội thoại thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin cuộc hội thoại theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(ConversationDetailEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.CONVERSATION_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const conversation = await this.conversationService.findById(id)
    return { message: "Lấy thông tin cuộc hội thoại thành công", data: conversation }
  }

  @ApiOperation({ summary: "Cập nhật cuộc hội thoại" })
  @ApiOkResponse({ type: ApiResponseOf(ConversationDetailEntity) })
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
}
