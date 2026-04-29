import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Min } from "class-validator"

export class MessageSearchQueryDto {
  @ApiProperty({ example: "đơn hàng", description: "Từ khóa tìm kiếm text thường theo content" })
  @IsString()
  q: string

  @ApiProperty({ example: 20, required: false, description: "Số lượng kết quả mỗi lần tải" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20

  @ApiProperty({
    example: "2026-04-30T04:30:10.000Z",
    required: false,
    description: "Cursor theo createdAt/timestamp (ISO string)",
  })
  @IsString()
  @IsOptional()
  cursorTime?: string

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false,
    description: "Cursor tie-breaker theo id",
  })
  @IsString()
  @IsOptional()
  cursorId?: string
}
