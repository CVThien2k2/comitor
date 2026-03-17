import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsBoolean } from "class-validator"

export class UpdateMessageDto {
  @ApiProperty({ example: "Nội dung đã chỉnh sửa", required: false })
  @IsString()
  @IsOptional()
  content?: string

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean
}
