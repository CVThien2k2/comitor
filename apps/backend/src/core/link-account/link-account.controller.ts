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
import { LinkAccountQueryDto } from "./dto/link-account-query.dto"
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
import { UpdateLinkAccountDto } from "./dto/update-link-account.dto"
import { LinkAccountEntity } from "./entities/link-account.entity"
import { LinkAccountStatsEntity } from "./entities/link-account-stats.entity"
import { LinkAccountReconnectService } from "./link-account-reconnect.service"
import { LinkAccountService } from "./link-account.service"

@ApiTags("Link Accounts")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("link-accounts")
export class LinkAccountController {
  constructor(
    private readonly linkAccountService: LinkAccountService,
    private readonly linkAccountReconnectService: LinkAccountReconnectService
  ) {}

  @ApiOperation({ summary: "Lấy danh sách liên kết kênh" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(LinkAccountEntity) })
  @Permissions(P.LINK_ACCOUNT_READ)
  @Get()
  async findAll(@Query() query: LinkAccountQueryDto) {
    const data = await this.linkAccountService.findAll(query)
    return { message: "Lấy danh sách liên kết kênh thành công", data }
  }

  @ApiOperation({ summary: "Lấy thống kê liên kết kênh" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountStatsEntity) })
  @Permissions(P.LINK_ACCOUNT_READ)
  @Get("stats")
  async getStats() {
    const data = await this.linkAccountService.getStats()
    return { message: "Lấy thống kê liên kết kênh thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin liên kết kênh theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountEntity) })
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

  @ApiOperation({ summary: "Kết nối lại liên kết kênh đã bị ngắt" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.LINK_ACCOUNT_UPDATE)
  @Post(":id/reconnect")
  async reconnect(@Param("id") id: string) {
    const account = await this.linkAccountReconnectService.reconnect(id)
    return { message: "Reconnect liên kết kênh thành công", data: account }
  }

  @ApiOperation({ summary: "Tắt liên kết kênh đang hoạt động" })
  @ApiOkResponse({ type: ApiResponseOf(LinkAccountEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.LINK_ACCOUNT_UPDATE)
  @Post(":id/disconnect")
  async disconnect(@Param("id") id: string) {
    const account = await this.linkAccountReconnectService.disconnect(id)
    return { message: "Tắt liên kết kênh thành công", data: account }
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
}
