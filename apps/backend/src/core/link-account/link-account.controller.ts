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
import { LinkAccountEntity, LinkAccountListEntity, LinkAccountDetailEntity } from "./entities/link-account.entity"
import { LinkAccountService } from "./link-account.service"
import { UpdateLinkAccountDto } from "./dto/update-link-account.dto"
import { LinkOAuthDto } from "./dto/link-oauth.dto"

@ApiTags("Link Accounts")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("link-accounts")
export class LinkAccountController {
  constructor(private readonly linkAccountService: LinkAccountService) {}

  @ApiOperation({ summary: "Lấy danh sách liên kết kênh" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(LinkAccountListEntity) })
  @Permissions(P.LINK_ACCOUNT_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.linkAccountService.findAll(query)
    return { message: "Lấy danh sách liên kết kênh thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin liên kết kênh theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountDetailEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.LINK_ACCOUNT_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const account = await this.linkAccountService.findById(id)
    return { message: "Lấy thông tin liên kết kênh thành công", data: account }
  }

  @ApiOperation({ summary: "Cập nhật liên kết kênh" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.LINK_ACCOUNT_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateLinkAccountDto) {
    const account = await this.linkAccountService.update(id, dto)
    return { message: "Cập nhật liên kết kênh thành công", data: account }
  }

  @ApiOperation({ summary: "Xóa liên kết kênh" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.LINK_ACCOUNT_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.linkAccountService.delete(id)
    return { message: "Xóa liên kết kênh thành công" }
  }

  // ─── OAuth Linking ────────────────────────────────────

  @ApiOperation({ summary: "Liên kết Zalo OA qua OAuth" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountDetailEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @Post("zalo-oa")
  async linkZaloOa(@Body() dto: LinkOAuthDto, @Request() req: any) {
    const data = await this.linkAccountService.linkZaloOa(dto.code, req.user.id)
    return { message: "Liên kết Zalo OA thành công", data }
  }

  @ApiOperation({ summary: "Liên kết Meta/Facebook qua OAuth" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountDetailEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @Post("meta")
  async linkMeta(@Body() dto: LinkOAuthDto, @Request() req: any) {
    const data = await this.linkAccountService.linkMeta(dto.code, req.user.id)
    return { message: "Liên kết Meta/Facebook thành công", data }
  }
}
