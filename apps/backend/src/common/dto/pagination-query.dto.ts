import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Min } from "class-validator"

export class PaginationQueryDto {
  @ApiProperty({ example: 1, required: false, description: "Số trang (bắt đầu từ 1)" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiProperty({ example: 20, required: false, description: "Số lượng mỗi trang" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20

  @ApiProperty({ example: "admin", required: false, description: "Từ khóa tìm kiếm" })
  @IsString()
  @IsOptional()
  search?: string
}
