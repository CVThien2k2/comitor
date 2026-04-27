import { ApiProperty } from "@nestjs/swagger"
import { ChannelType } from "@workspace/database"
import { IsEnum, IsOptional } from "class-validator"
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto"

export class LinkAccountQueryDto extends PaginationQueryDto {
  @ApiProperty({
    example: ChannelType.facebook,
    required: false,
    description: "Lọc theo provider",
    enum: ChannelType,
  })
  @IsEnum(ChannelType)
  @IsOptional()
  provider?: ChannelType
}
