import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator"

export enum MessageCursorDirection {
  older = "older",
  newer = "newer",
}

export class MessageCursorQueryDto {
  @ApiProperty({ example: 30, required: false, description: "Số lượng tin nhắn mỗi lần tải" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 30

  @ApiProperty({
    example: "2026-04-30T04:30:10.000Z",
    required: false,
    description: "Cursor theo timestamp (ISO string)",
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

  @ApiProperty({
    example: MessageCursorDirection.older,
    required: false,
    enum: MessageCursorDirection,
    description: "Hướng tải thêm tin nhắn",
  })
  @IsEnum(MessageCursorDirection)
  @IsOptional()
  direction?: MessageCursorDirection = MessageCursorDirection.older
}
