import { Controller, Get, Query } from "@nestjs/common"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { ApiPaginatedResponseOf } from "../../common/entities/api-response.entity"
import { AccountCustomerListEntity } from "./entities/account-customer.entity"
import { AccountCustomerService } from "./account-customer.service"

@ApiTags("Account Customers")
@ApiBearerAuth()
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

}
