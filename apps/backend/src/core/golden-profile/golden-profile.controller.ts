import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { ApiPaginatedResponseOf, ApiResponseOf } from "../../common/entities/api-response.entity"
import { UpdateGoldenProfileDto } from "./dto/update-golden-profile.dto"
import { GoldenProfileDetailEntity, GoldenProfileEntity } from "./entities/golden-profile.entity"
import { GoldenProfileService } from "./golden-profile.service"

@ApiTags("Golden Profiles")
@ApiBearerAuth()
@Controller("golden-profiles")
export class GoldenProfileController {
  constructor(private readonly goldenProfileService: GoldenProfileService) {}

  @ApiOperation({ summary: "Lấy danh sách hồ sơ khách hàng" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(GoldenProfileEntity) })
  @Permissions(P.GOLDEN_PROFILE_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.goldenProfileService.findAll(query)
    return { message: "Lấy danh sách hồ sơ khách hàng thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin hồ sơ khách hàng theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(GoldenProfileDetailEntity) })
  @Permissions(P.GOLDEN_PROFILE_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const profile = await this.goldenProfileService.findById(id)
    return { message: "Lấy thông tin hồ sơ khách hàng thành công", data: profile }
  }

  @ApiOperation({ summary: "Cập nhật hồ sơ khách hàng" })
  @ApiOkResponse({ type: ApiResponseOf(GoldenProfileEntity) })
  @Permissions(P.GOLDEN_PROFILE_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateGoldenProfileDto) {
    const profile = await this.goldenProfileService.update(id, dto)
    return { message: "Cập nhật hồ sơ khách hàng thành công", data: profile }
  }
}
