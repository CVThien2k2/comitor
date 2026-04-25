import { ApiProperty } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator"

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

  @ApiProperty({ example: false, required: false, description: "Chỉ lấy cuộc hội thoại chưa đọc" })
  // axios gửi boolean dưới dạng string ("true"/"false"),
  // nếu dùng `@Type(() => Boolean)` thì "false" sẽ bị cast thành true.
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined
    if (typeof value === "boolean") return value
    if (typeof value === "string") return value.toLowerCase() === "true"
    return Boolean(value)
  })
  @IsBoolean()
  @IsOptional()
  unread?: boolean

  @ApiProperty({
    example: false,
    required: false,
    description: "Chỉ lấy cuộc hội thoại đang được xử lý bởi người dùng hiện tại",
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined
    if (typeof value === "boolean") return value
    if (typeof value === "string") return value.toLowerCase() === "true"
    return Boolean(value)
  })
  @IsBoolean()
  @IsOptional()
  myProcessing?: boolean
}
