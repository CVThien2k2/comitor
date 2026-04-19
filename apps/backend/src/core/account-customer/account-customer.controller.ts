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
import {
  AccountCustomerEntity,
  AccountCustomerListEntity,
  AccountCustomerDetailEntity,
} from "./entities/account-customer.entity"
import { AccountCustomerService } from "./account-customer.service"
import { UpdateAccountCustomerDto } from "./dto/update-account-customer.dto"

@ApiTags("Account Customers")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiForbiddenResponse({ type: ForbiddenEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("account-customers")
export class AccountCustomerController {
  constructor(private readonly accountCustomerService: AccountCustomerService) {}

  @ApiOperation({ summary: "Lấy danh sách tài khoản khách" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(AccountCustomerListEntity) })
  @Permissions(P.ACCOUNT_CUSTOMER_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.accountCustomerService.findAll(query)
    return { message: "Lấy danh sách tài khoản khách thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin tài khoản khách theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(AccountCustomerDetailEntity) })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.ACCOUNT_CUSTOMER_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const account = await this.accountCustomerService.findById(id)
    return { message: "Lấy thông tin tài khoản khách thành công", data: account }
  }

  @ApiOperation({ summary: "Cập nhật tài khoản khách" })
  @ApiOkResponse({ type: ApiResponseOf(AccountCustomerEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.ACCOUNT_CUSTOMER_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAccountCustomerDto) {
    const account = await this.accountCustomerService.update(id, dto)
    return { message: "Cập nhật tài khoản khách thành công", data: account }
  }

  @ApiOperation({ summary: "Xóa tài khoản khách" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiNotFoundResponse({ type: NotFoundEntity })
  @Permissions(P.ACCOUNT_CUSTOMER_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.accountCustomerService.delete(id)
    return { message: "Xóa tài khoản khách thành công" }
  }
}
