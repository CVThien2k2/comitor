import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common"
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
import { CreateSuggestedMessageDto } from "./dto/create-suggested-message.dto"
import { UpdateSuggestedMessageDto } from "./dto/update-sugggested-message.dto"
import { SuggestedMessageEntity } from "./entities/suggested-message.entity"
import { SuggestedMessageService } from "./suggested-message.service"

@ApiTags("Suggested Messages")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("suggested-messages")
export class SuggestedMessageController {
  constructor(private readonly suggestedMessageService: SuggestedMessageService) {}

  @ApiOperation({ summary: "Lấy danh sách tin nhắn gợi ý" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(SuggestedMessageEntity) })
  @Permissions(P.MESSAGE_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.suggestedMessageService.findAll(query)
    return { message: "Lấy danh sách tin nhắn gợi ý thành công", data }
  }

  @ApiOperation({ summary: "Lấy chi tiết tin nhắn gợi ý" })
  @ApiOkResponse({ type: ApiResponseOf(SuggestedMessageEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const data = await this.suggestedMessageService.findById(id)
    return { message: "Lấy chi tiết tin nhắn gợi ý thành công", data }
  }

  @ApiOperation({ summary: "Tạo tin nhắn gợi ý" })
  @ApiOkResponse({ type: ApiResponseOf(SuggestedMessageEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @Permissions(P.MESSAGE_CREATE)
  @Post()
  async create(@Body() dto: CreateSuggestedMessageDto) {
    const data = await this.suggestedMessageService.create(dto)
    return { message: "Tạo tin nhắn gợi ý thành công", data }
  }

  @ApiOperation({ summary: "Cập nhật tin nhắn gợi ý" })
  @ApiOkResponse({ type: ApiResponseOf(SuggestedMessageEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateSuggestedMessageDto) {
    const data = await this.suggestedMessageService.update(id, dto)
    return { message: "Cập nhật tin nhắn gợi ý thành công", data }
  }

  @ApiOperation({ summary: "Xóa tin nhắn gợi ý" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.MESSAGE_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.suggestedMessageService.delete(id)
    return { message: "Xóa tin nhắn gợi ý thành công" }
  }
}
