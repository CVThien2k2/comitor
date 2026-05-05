import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import { P } from "@workspace/database"
import type { User } from "@workspace/database"
import type { Request as ExpressRequest } from "express"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import {
  ApiPaginatedResponseOf,
  ApiResponseOf,
  MessageResponseEntity,
} from "../../common/entities/api-response.entity"
import { CreateSuggestedMessageDto } from "./dto/create-suggested-message.dto"
import { UpdateSuggestedMessageDto } from "./dto/update-sugggested-message.dto"
import { SuggestedMessageEntity } from "./entities/suggested-message.entity"
import { SuggestedMessageService } from "./suggested-message.service"

interface RequestWithUser extends ExpressRequest {
  user: User
}

@ApiTags("Suggested Messages")
@ApiBearerAuth()
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

  @ApiOperation({ summary: "Tạo tin nhắn gợi ý" })
  @ApiOkResponse({ type: ApiResponseOf(SuggestedMessageEntity) })
  @Permissions(P.MESSAGE_CREATE)
  @Post()
  async create(@Body() dto: CreateSuggestedMessageDto, @Request() req: RequestWithUser) {
    const data = await this.suggestedMessageService.create(dto, req.user.id)
    return { message: "Tạo tin nhắn gợi ý thành công", data }
  }

  @ApiOperation({ summary: "Cập nhật tin nhắn gợi ý" })
  @ApiOkResponse({ type: ApiResponseOf(SuggestedMessageEntity) })
  @Permissions(P.MESSAGE_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateSuggestedMessageDto) {
    const data = await this.suggestedMessageService.update(id, dto)
    return { message: "Cập nhật tin nhắn gợi ý thành công", data }
  }

  @ApiOperation({ summary: "Xóa tin nhắn gợi ý" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @Permissions(P.MESSAGE_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.suggestedMessageService.delete(id)
    return { message: "Xóa tin nhắn gợi ý thành công" }
  }
}
