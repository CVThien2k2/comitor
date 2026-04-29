import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsBoolean, IsOptional, IsString } from "class-validator"
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto"

export class ConversationQueryDto extends PaginationQueryDto {
  @ApiProperty({
    example: "2026-04-29T04:30:10.000Z",
    required: false,
    description: "Cursor theo lastActivityAt (ISO string)",
  })
  @IsString()
  @IsOptional()
  cursorLastActivityAt?: string

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false,
    description: "Cursor tie-breaker theo id",
  })
  @IsString()
  @IsOptional()
  cursorId?: string

  @ApiProperty({ example: false, required: false, description: "Chỉ lấy cuộc hội thoại chưa đọc" })
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
